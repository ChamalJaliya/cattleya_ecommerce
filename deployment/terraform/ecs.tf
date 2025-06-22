# ECS Task Definition
resource "aws_ecs_task_definition" "cattleya_backend" {
  family                   = "cattleya-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "cattleya-backend"
      image = "${aws_ecr_repository.cattleya_backend.repository_url}:latest"

      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_URL"
          value = "mongodb://${aws_docdb_cluster.cattleya.master_username}:${aws_secretsmanager_secret_version.db_password.secret_string}@${aws_docdb_cluster.cattleya.endpoint}:${aws_docdb_cluster.cattleya.port}/cattleya?retryWrites=false"
        },
        {
          name  = "AWS_REGION"
          value = data.aws_region.current.name
        },
        {
          name  = "S3_MEDIA_BUCKET"
          value = aws_s3_bucket.cattleya_media.bucket
        },
        {
          name  = "CLOUDFRONT_DOMAIN"
          value = aws_cloudfront_distribution.cattleya_media.domain_name
        },
        {
          name  = "ORDER_PROCESSING_QUEUE_URL"
          value = aws_sqs_queue.order_processing.url
        },
        {
          name  = "EMAIL_QUEUE_URL"
          value = aws_sqs_queue.email_queue.url
        },
        {
          name  = "ORDER_NOTIFICATIONS_TOPIC_ARN"
          value = aws_sns_topic.order_notifications.arn
        },
        {
          name  = "CUSTOMER_NOTIFICATIONS_TOPIC_ARN"
          value = aws_sns_topic.customer_notifications.arn
        },
        {
          name  = "SYSTEM_ALERTS_TOPIC_ARN"
          value = aws_sns_topic.system_alerts.arn
        }
      ]

      secrets = [
        {
          name      = "JWT_SECRET"
          valueFrom = aws_secretsmanager_secret.jwt_secret.arn
        },
        {
          name      = "STRIPE_SECRET_KEY"
          valueFrom = aws_secretsmanager_secret.stripe_secret.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.cattleya_backend.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "ecs"
        }
      }

      healthCheck = {
        command = [
          "CMD-SHELL",
          "curl -f http://localhost:3001/api/health || exit 1"
        ]
        interval = 30
        timeout  = 5
        retries  = 3
        startPeriod = 60
      }

      essential = true
    }
  ])

  tags = {
    Name = "cattleya-backend-task"
  }
}

# ECS Service
resource "aws_ecs_service" "cattleya_backend" {
  name            = "cattleya-backend-service"
  cluster         = aws_ecs_cluster.cattleya.id
  task_definition = aws_ecs_task_definition.cattleya_backend.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.cattleya.arn
    container_name   = "cattleya-backend"
    container_port   = 3001
  }

  depends_on = [aws_lb_listener.cattleya]

  deployment_configuration {
    deployment_circuit_breaker {
      enable   = true
      rollback = true
    }
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }

  lifecycle {
    ignore_changes = [desired_count]
  }

  tags = {
    Name = "cattleya-backend-service"
  }
}

# Auto Scaling Target
resource "aws_appautoscaling_target" "cattleya_backend" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.cattleya.name}/${aws_ecs_service.cattleya_backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# CPU Auto Scaling Policy
resource "aws_appautoscaling_policy" "cattleya_backend_cpu" {
  name               = "cattleya-backend-cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.cattleya_backend.resource_id
  scalable_dimension = aws_appautoscaling_target.cattleya_backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.cattleya_backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Memory Auto Scaling Policy
resource "aws_appautoscaling_policy" "cattleya_backend_memory" {
  name               = "cattleya-backend-memory-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.cattleya_backend.resource_id
  scalable_dimension = aws_appautoscaling_target.cattleya_backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.cattleya_backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 80.0
  }
}

# CloudWatch Alarms for Auto Scaling
resource "aws_cloudwatch_metric_alarm" "cattleya_backend_cpu_high" {
  alarm_name          = "cattleya-backend-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS CPU utilization"
  alarm_actions       = [aws_sns_topic.system_alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.cattleya.name
    ServiceName = aws_ecs_service.cattleya_backend.name
  }

  tags = {
    Name = "cattleya-backend-cpu-high"
  }
}

resource "aws_cloudwatch_metric_alarm" "cattleya_backend_memory_high" {
  alarm_name          = "cattleya-backend-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS memory utilization"
  alarm_actions       = [aws_sns_topic.system_alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.cattleya.name
    ServiceName = aws_ecs_service.cattleya_backend.name
  }

  tags = {
    Name = "cattleya-backend-memory-high"
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "cattleya" {
  dashboard_name = "cattleya-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ClusterName", aws_ecs_cluster.cattleya.name, "ServiceName", aws_ecs_service.cattleya_backend.name],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = data.aws_region.current.name
          title  = "ECS Service Metrics"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.cattleya.arn_suffix],
            [".", "TargetResponseTime", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          region = data.aws_region.current.name
          title  = "Load Balancer Metrics"
        }
      }
    ]
  })
}

# Outputs
output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.cattleya_backend.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.cattleya.arn
}

output "ecs_task_definition_arn" {
  description = "ECS task definition ARN"
  value       = aws_ecs_task_definition.cattleya_backend.arn
} 