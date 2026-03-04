import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StoredFile, VideoStorageProvider } from "./storage.types";

const PRESIGNED_URL_EXPIRY = 3600; // 1 hour

function getS3Client() {
  return new S3Client({
    region: process.env.AWS_REGION || "us-east-2",
  });
}

function getBucket(): string {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error("AWS_S3_BUCKET is not set");
  return bucket;
}

export const s3Storage: VideoStorageProvider = {
  async save(key: string, data: Buffer): Promise<StoredFile> {
    const client = getS3Client();
    const bucket = getBucket();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: getContentType(key),
      }),
    );

    const url = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: PRESIGNED_URL_EXPIRY },
    );

    return {
      name: key.split("/").pop() || key,
      url,
      path: key,
    };
  },

  async list(prefix: string): Promise<StoredFile[]> {
    const client = getS3Client();
    const bucket = getBucket();

    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix.endsWith("/") ? prefix : `${prefix}/`,
      }),
    );

    if (!response.Contents) return [];

    const files: StoredFile[] = [];
    for (const obj of response.Contents) {
      if (!obj.Key || obj.Key.endsWith("/")) continue;

      const url = await getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: bucket, Key: obj.Key }),
        { expiresIn: PRESIGNED_URL_EXPIRY },
      );

      files.push({
        name: obj.Key.split("/").pop() || obj.Key,
        url,
        path: obj.Key,
      });
    }

    return files;
  },

  getUrl(_filename: string, _directory: string): string {
    // For S3, always use presigned URLs via save() or list()
    throw new Error("Use save() or list() to get presigned URLs");
  },
};

export async function getPresignedUrl(key: string): Promise<string> {
  const client = getS3Client();
  const bucket = getBucket();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: PRESIGNED_URL_EXPIRY },
  );
}

export async function downloadFromS3(key: string): Promise<Buffer> {
  const client = getS3Client();
  const bucket = getBucket();
  const response = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );

  const stream = response.Body;
  if (!stream) throw new Error(`Empty response for key: ${key}`);

  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function uploadToS3(key: string, data: Buffer): Promise<string> {
  const client = getS3Client();
  const bucket = getBucket();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: getContentType(key),
    }),
  );

  return getPresignedUrl(key);
}

export async function copyInS3(
  sourceKey: string,
  destKey: string,
  sourceBucket?: string,
): Promise<void> {
  const client = getS3Client();
  const bucket = getBucket();
  const srcBucket = sourceBucket ?? bucket;
  await client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${srcBucket}/${sourceKey}`,
      Key: destKey,
      ContentType: getContentType(destKey),
    }),
  );
}

/**
 * Extract the S3 key from a presigned S3 URL.
 * Works with both path-style and virtual-hosted-style URLs.
 */
export function s3KeyFromUrl(url: string, bucket?: string): string | null {
  const targetBucket = bucket ?? getBucket();
  try {
    const parsed = new URL(url);
    // Virtual-hosted: https://<bucket>.s3.<region>.amazonaws.com/<key>
    if (parsed.hostname.startsWith(`${targetBucket}.`)) {
      return decodeURIComponent(parsed.pathname.slice(1));
    }
    // Path-style: https://s3.<region>.amazonaws.com/<bucket>/<key>
    const prefix = `/${targetBucket}/`;
    if (parsed.pathname.startsWith(prefix)) {
      return decodeURIComponent(parsed.pathname.slice(prefix.length));
    }
  } catch {}
  return null;
}

function getContentType(key: string): string {
  if (key.endsWith(".mp3")) return "audio/mpeg";
  if (key.endsWith(".mp4")) return "video/mp4";
  if (key.endsWith(".webm")) return "video/webm";
  return "application/octet-stream";
}
