# Environment Setup for Cattleya Backend

## S3 Configuration

The S3 service has been updated to use the correct environment variable names and **requires** proper configuration. Create a `.env` file in the `cattleya-backend` root directory with the following variables:

```env
# S3 Configuration (REQUIRED)
S3_ACCESS_KEY_ID=your_access_key_id
S3_SECRET_ACCESS_KEY=your_secret_access_key
S3_BUCKET=cattleya-app-uploads
AWS_REGION=us-east-1

# Database Configuration
DATABASE_URL=mongodb+srv://cattleya_admin:your_password@cluster.mongodb.net/cattleya?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Application Configuration
NODE_ENV=development
PORT=3001
```

## Changes Made

1. **S3 Service (`src/shared/s3/s3.service.ts`)**: Updated to look for environment variables in the correct order:
   - `S3_ACCESS_KEY_ID` (primary) → `AWS_ACCESS_KEY_ID` (fallback)
   - `S3_SECRET_ACCESS_KEY` (primary) → `AWS_SECRET_ACCESS_KEY` (fallback)
   - `S3_BUCKET` (primary) → `AWS_S3_BUCKET_NAME` (fallback)
   - **Removed all hardcoded default values for security**
   - **Added validation to ensure required environment variables are set**

2. **AWS Config (`src/shared/config/aws.config.ts`)**: Updated to support both naming conventions for backward compatibility.

## Environment Variable Priority

The system now checks for environment variables in this order:
1. S3-specific variables (e.g., `S3_ACCESS_KEY_ID`)
2. AWS general variables (e.g., `AWS_ACCESS_KEY_ID`)
3. **Throws an error if required variables are missing**

## Security Improvements

- **No hardcoded credentials**: All default values have been removed
- **Required configuration**: The application will fail to start if S3 credentials are not properly configured
- **Clear error messages**: Helpful error messages guide you to set the correct environment variables

## Required Environment Variables

The following environment variables are **required** for the S3 service to work:
- `S3_ACCESS_KEY_ID` or `AWS_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY` or `AWS_SECRET_ACCESS_KEY`  
- `S3_BUCKET` or `AWS_S3_BUCKET_NAME`
- `AWS_REGION` 