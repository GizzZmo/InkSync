import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

export const S3_BUCKET = env.S3_BUCKET_NAME ?? 'inksync-uploads';
export const CLOUDFRONT_URL = env.CLOUDFRONT_URL ?? '';

export function getPublicUrl(s3Key: string): string {
  if (CLOUDFRONT_URL) {
    return `${CLOUDFRONT_URL}/${s3Key}`;
  }
  return `https://${S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${s3Key}`;
}
