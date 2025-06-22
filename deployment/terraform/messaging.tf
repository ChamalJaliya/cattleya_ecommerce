# SQS Queues

# Order Processing Queue
resource "aws_sqs_queue" "order_processing" {
  name                      = "cattleya-order-processing"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 0
  visibility_timeout_seconds = 30

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.order_processing_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Name = "cattleya-order-processing"
  }
}

# Dead Letter Queue for Order Processing
resource "aws_sqs_queue" "order_processing_dlq" {
  name = "cattleya-order-processing-dlq"

  tags = {
    Name = "cattleya-order-processing-dlq"
  }
}

# Email Queue
resource "aws_sqs_queue" "email_queue" {
  name                      = "cattleya-email-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 0

  tags = {
    Name = "cattleya-email-queue"
  }
}

# Notification Queue
resource "aws_sqs_queue" "notification_queue" {
  name                      = "cattleya-notification-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 0

  tags = {
    Name = "cattleya-notification-queue"
  }
}

# SNS Topics

# Order Notifications Topic
resource "aws_sns_topic" "order_notifications" {
  name = "cattleya-order-notifications"

  tags = {
    Name = "cattleya-order-notifications"
  }
}

# Customer Notifications Topic
resource "aws_sns_topic" "customer_notifications" {
  name = "cattleya-customer-notifications"

  tags = {
    Name = "cattleya-customer-notifications"
  }
}

# System Alerts Topic
resource "aws_sns_topic" "system_alerts" {
  name = "cattleya-system-alerts"

  tags = {
    Name = "cattleya-system-alerts"
  }
}

# SNS Topic Subscriptions
resource "aws_sns_topic_subscription" "order_notifications_email" {
  topic_arn = aws_sns_topic.order_notifications.arn
  protocol  = "email"
  endpoint  = var.admin_email
}

resource "aws_sns_topic_subscription" "customer_notifications_email" {
  topic_arn = aws_sns_topic.customer_notifications.arn
  protocol  = "email"
  endpoint  = var.admin_email
}

resource "aws_sns_topic_subscription" "system_alerts_email" {
  topic_arn = aws_sns_topic.system_alerts.arn
  protocol  = "email"
  endpoint  = var.admin_email
}

# SQS to SNS Integration
resource "aws_sns_topic_subscription" "order_processing_sqs" {
  topic_arn = aws_sns_topic.order_notifications.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.order_processing.arn
}

# SES Configuration

# SES Domain Verification
resource "aws_ses_domain_identity" "cattleya" {
  domain = var.domain_name
}

# SES DKIM
resource "aws_ses_domain_dkim" "cattleya" {
  domain = aws_ses_domain_identity.cattleya.domain
}

# SES Email Templates
resource "aws_ses_template" "order_confirmation" {
  name    = "order-confirmation"
  subject = "Order Confirmation - Cattleya"
  html    = file("${path.module}/templates/order-confirmation.html")
  text    = file("${path.module}/templates/order-confirmation.txt")
}

resource "aws_ses_template" "password_reset" {
  name    = "password-reset"
  subject = "Password Reset Request - Cattleya"
  html    = file("${path.module}/templates/password-reset.html")
  text    = file("${path.module}/templates/password-reset.txt")
}

resource "aws_ses_template" "welcome_email" {
  name    = "welcome-email"
  subject = "Welcome to Cattleya!"
  html    = file("${path.module}/templates/welcome-email.html")
  text    = file("${path.module}/templates/welcome-email.txt")
}

# SES Configuration Set
resource "aws_ses_configuration_set" "cattleya" {
  name = "cattleya-config-set"

  delivery_options {
    tls_policy = "Require"
  }

  reputation_metrics_enabled = true
  last_fresh_start          = "2024-01-01T00:00:00Z"
}

# SES Event Destination for SNS
resource "aws_ses_event_destination" "cattleya_sns" {
  name                   = "cattleya-sns-events"
  configuration_set_name = aws_ses_configuration_set.cattleya.name
  enabled                = true
  matching_types         = ["bounce", "complaint", "delivery"]

  sns_destination {
    topic_arn = aws_sns_topic.system_alerts.arn
  }
}

# IAM Policy for SQS Access
resource "aws_iam_policy" "sqs_access" {
  name        = "cattleya-sqs-access"
  description = "Policy for SQS access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = [
          aws_sqs_queue.order_processing.arn,
          aws_sqs_queue.email_queue.arn,
          aws_sqs_queue.notification_queue.arn
        ]
      }
    ]
  })
}

# IAM Policy for SES Access
resource "aws_iam_policy" "ses_access" {
  name        = "cattleya-ses-access"
  description = "Policy for SES access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM Policy for SNS Access
resource "aws_iam_policy" "sns_access" {
  name        = "cattleya-sns-access"
  description = "Policy for SNS access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = [
          aws_sns_topic.order_notifications.arn,
          aws_sns_topic.customer_notifications.arn,
          aws_sns_topic.system_alerts.arn
        ]
      }
    ]
  })
}

# Attach policies to ECS task role
resource "aws_iam_role_policy_attachment" "ecs_task_sqs" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = aws_iam_policy.sqs_access.arn
}

resource "aws_iam_role_policy_attachment" "ecs_task_ses" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = aws_iam_policy.ses_access.arn
}

resource "aws_iam_role_policy_attachment" "ecs_task_sns" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = aws_iam_policy.sns_access.arn
}

# Variables
variable "domain_name" {
  description = "Domain name for SES"
  type        = string
  default     = "cattleya.com"
}

variable "admin_email" {
  description = "Admin email for notifications"
  type        = string
}

# Outputs
output "order_processing_queue_url" {
  description = "Order processing queue URL"
  value       = aws_sqs_queue.order_processing.url
}

output "email_queue_url" {
  description = "Email queue URL"
  value       = aws_sqs_queue.email_queue.url
}

output "order_notifications_topic_arn" {
  description = "Order notifications topic ARN"
  value       = aws_sns_topic.order_notifications.arn
}

output "customer_notifications_topic_arn" {
  description = "Customer notifications topic ARN"
  value       = aws_sns_topic.customer_notifications.arn
}

output "system_alerts_topic_arn" {
  description = "System alerts topic ARN"
  value       = aws_sns_topic.system_alerts.arn
} 