terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "cattleya-terraform-state"
    key    = "cattleya/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
  
  default_tags {
    tags = {
      Project     = "cattleya"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# Random string for unique resource names
resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# VPC Configuration
resource "aws_vpc" "cattleya_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "cattleya-vpc"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.cattleya_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "cattleya-public-${count.index + 1}"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.cattleya_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "cattleya-private-${count.index + 1}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.cattleya_vpc.id

  tags = {
    Name = "cattleya-igw"
  }
}

# Elastic IP for NAT
resource "aws_eip" "nat" {
  domain = "vpc"
  
  depends_on = [aws_internet_gateway.main]
}

# NAT Gateway
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "cattleya-nat"
  }

  depends_on = [aws_internet_gateway.main]
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.cattleya_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "cattleya-public-rt"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.cattleya_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "cattleya-private-rt"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# Security Groups
resource "aws_security_group" "alb" {
  name        = "cattleya-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.cattleya_vpc.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "cattleya-alb-sg"
  }
}

resource "aws_security_group" "ecs" {
  name        = "cattleya-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.cattleya_vpc.id

  ingress {
    description     = "From ALB"
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "cattleya-ecs-sg"
  }
}

resource "aws_security_group" "docdb" {
  name        = "cattleya-docdb-sg"
  description = "Security group for DocumentDB cluster"
  vpc_id      = aws_vpc.cattleya_vpc.id

  ingress {
    description     = "From ECS"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "cattleya-docdb-sg"
  }
}

# Application Load Balancer
resource "aws_lb" "cattleya" {
  name               = "cattleya-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "cattleya-alb"
  }
}

resource "aws_lb_target_group" "cattleya" {
  name     = "cattleya-tg"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = aws_vpc.cattleya_vpc.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/api/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name = "cattleya-tg"
  }
}

resource "aws_lb_listener" "cattleya" {
  load_balancer_arn = aws_lb.cattleya.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cattleya.arn
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "cattleya" {
  name = "cattleya-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "cattleya-cluster"
  }
}

# ECR Repository
resource "aws_ecr_repository" "cattleya_backend" {
  name                 = "cattleya-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "cattleya-backend"
  }
}

# Secrets Manager
resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "cattleya/jwt-secret"
  
  tags = {
    Name = "cattleya-jwt-secret"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_string.jwt_secret.result
}

resource "random_string" "jwt_secret" {
  length  = 64
  special = true
}

resource "aws_secretsmanager_secret" "stripe_secret" {
  name = "cattleya/stripe-secret"
  
  tags = {
    Name = "cattleya-stripe-secret"
  }
}

resource "aws_secretsmanager_secret_version" "stripe_secret" {
  secret_id     = aws_secretsmanager_secret.stripe_secret.id
  secret_string = var.stripe_secret_key
}

# IAM Roles
resource "aws_iam_role" "ecs_task_execution" {
  name = "cattleya-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task" {
  name = "cattleya-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "cattleya_backend" {
  name              = "/ecs/cattleya-backend"
  retention_in_days = 30

  tags = {
    Name = "cattleya-backend-logs"
  }
}

# Variables
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "stripe_secret_key" {
  description = "Stripe secret key"
  type        = string
  sensitive   = true
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.cattleya_vpc.id
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.cattleya.dns_name
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.cattleya_backend.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.cattleya.name
} 