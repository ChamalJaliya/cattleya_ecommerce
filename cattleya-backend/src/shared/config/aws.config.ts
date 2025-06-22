import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  s3BucketName: process.env.S3_BUCKET || process.env.AWS_S3_BUCKET_NAME,
})); 