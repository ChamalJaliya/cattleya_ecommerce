# S3 Bucket for Media
resource "aws_s3_bucket" "cattleya_media" {
  bucket = "cattleya-media-${random_string.bucket_suffix.result}"

  tags = {
    Name = "cattleya-media-bucket"
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "cattleya_media" {
  bucket = aws_s3_bucket.cattleya_media.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Server Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "cattleya_media" {
  bucket = aws_s3_bucket.cattleya_media.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "cattleya_media" {
  bucket = aws_s3_bucket.cattleya_media.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket CORS Configuration
resource "aws_s3_bucket_cors_configuration" "cattleya_media" {
  bucket = aws_s3_bucket.cattleya_media.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = ["https://shop.cattleya.com", "https://cattleya.com", "https://api.cattleya.com"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# S3 Bucket Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "cattleya_media" {
  bucket = aws_s3_bucket.cattleya_media.id

  rule {
    id     = "media_lifecycle"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "cattleya_media" {
  comment = "Cattleya Media OAI"
}

# S3 Bucket Policy for CloudFront
resource "aws_s3_bucket_policy" "cattleya_media" {
  bucket = aws_s3_bucket.cattleya_media.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "CloudFrontAccess"
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.cattleya_media.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.cattleya_media.arn}/*"
      }
    ]
  })
}

# ACM Certificate for CloudFront
resource "aws_acm_certificate" "cattleya_media" {
  domain_name       = "media.cattleya.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "cattleya-media-cert"
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cattleya_media" {
  origin {
    domain_name = aws_s3_bucket.cattleya_media.bucket_regional_domain_name
    origin_id   = "S3-cattleya-media"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.cattleya_media.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["media.cattleya.com"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-cattleya-media"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Cache behavior for images
  ordered_cache_behavior {
    path_pattern     = "*.jpg"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-cattleya-media"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "*.png"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-cattleya-media"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
  }

  price_class = "PriceClass_100"

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn           = aws_acm_certificate.cattleya_media.arn
    ssl_support_method            = "sni-only"
    minimum_protocol_version      = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "cattleya-media-distribution"
  }
}

# S3 Bucket for Static Assets
resource "aws_s3_bucket" "cattleya_static" {
  bucket = "cattleya-static-${random_string.bucket_suffix.result}"

  tags = {
    Name = "cattleya-static-bucket"
  }
}

# S3 Bucket Versioning for Static
resource "aws_s3_bucket_versioning" "cattleya_static" {
  bucket = aws_s3_bucket.cattleya_static.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Server Side Encryption for Static
resource "aws_s3_bucket_server_side_encryption_configuration" "cattleya_static" {
  bucket = aws_s3_bucket.cattleya_static.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Public Access Block for Static
resource "aws_s3_bucket_public_access_block" "cattleya_static" {
  bucket = aws_s3_bucket.cattleya_static.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Outputs
output "s3_media_bucket" {
  description = "S3 media bucket name"
  value       = aws_s3_bucket.cattleya_media.bucket
}

output "s3_static_bucket" {
  description = "S3 static bucket name"
  value       = aws_s3_bucket.cattleya_static.bucket
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain"
  value       = aws_cloudfront_distribution.cattleya_media.domain_name
} 