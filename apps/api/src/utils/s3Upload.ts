import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET, getPublicUrl } from '../config/s3';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  s3Key: string;
  url: string;
}

export async function uploadToS3(
  buffer: Buffer,
  mimeType: string,
  folder: string
): Promise<UploadResult> {
  const ext = mimeType.split('/')[1] ?? 'bin';
  const s3Key = `${folder}/${uuidv4()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return { s3Key, url: getPublicUrl(s3Key) };
}

export async function getPresignedUploadUrl(
  folder: string,
  mimeType: string,
  expiresIn = 300
): Promise<{ uploadUrl: string; s3Key: string; publicUrl: string }> {
  const ext = mimeType.split('/')[1] ?? 'bin';
  const s3Key = `${folder}/${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return { uploadUrl, s3Key, publicUrl: getPublicUrl(s3Key) };
}

export async function deleteFromS3(s3Key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: s3Key })
  );
}

export async function getPresignedDownloadUrl(s3Key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: s3Key });
  return getSignedUrl(s3Client, command, { expiresIn });
}
