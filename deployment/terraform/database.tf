# DocumentDB Subnet Group
resource "aws_docdb_subnet_group" "cattleya" {
  name       = "cattleya-docdb-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "cattleya-docdb-subnet-group"
  }
}

# DocumentDB Parameter Group
resource "aws_docdb_cluster_parameter_group" "cattleya" {
  family = "docdb4.0"
  name   = "cattleya-docdb-params"

  parameter {
    name  = "tls"
    value = "enabled"
  }

  tags = {
    Name = "cattleya-docdb-params"
  }
}

# DocumentDB Cluster
resource "aws_docdb_cluster" "cattleya" {
  cluster_identifier      = "cattleya-cluster"
  engine                  = "docdb"
  master_username         = "cattleya_admin"
  master_password         = aws_secretsmanager_secret_version.db_password.secret_string
  db_subnet_group_name    = aws_docdb_subnet_group.cattleya.name
  vpc_security_group_ids  = [aws_security_group.docdb.id]
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.cattleya.name
  skip_final_snapshot     = true
  deletion_protection     = false
  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"
  preferred_maintenance_window = "sun:04:00-sun:05:00"

  tags = {
    Name = "cattleya-docdb-cluster"
  }
}

# DocumentDB Instances
resource "aws_docdb_cluster_instance" "cattleya" {
  count              = 2
  identifier         = "cattleya-instance-${count.index}"
  cluster_identifier = aws_docdb_cluster.cattleya.id
  instance_class     = "db.t3.medium"
  auto_minor_version_upgrade = true

  tags = {
    Name = "cattleya-docdb-instance-${count.index}"
  }
}

# Database Password Secret
resource "aws_secretsmanager_secret" "db_password" {
  name = "cattleya/db-password"
  
  tags = {
    Name = "cattleya-db-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_string.db_password.result
}

resource "random_string" "db_password" {
  length  = 16
  special = true
  upper   = true
  lower   = true
  numeric = true
}

# Outputs
output "docdb_endpoint" {
  description = "DocumentDB cluster endpoint"
  value       = aws_docdb_cluster.cattleya.endpoint
}

output "docdb_port" {
  description = "DocumentDB cluster port"
  value       = aws_docdb_cluster.cattleya.port
}

output "docdb_reader_endpoint" {
  description = "DocumentDB cluster reader endpoint"
  value       = aws_docdb_cluster.cattleya.reader_endpoint
} 