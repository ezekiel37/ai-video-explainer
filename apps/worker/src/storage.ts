import { readFile } from "node:fs/promises";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const provider = process.env.STORAGE_PROVIDER ?? "local";
const bucket = process.env.STORAGE_BUCKET;
const endpoint = process.env.STORAGE_ENDPOINT;
const accessKeyId = process.env.STORAGE_ACCESS_KEY;
const secretAccessKey = process.env.STORAGE_SECRET_KEY;
const publicBase = process.env.STORAGE_PUBLIC_URL;

const CONTENT_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  gif: "image/gif",
  png: "image/png"
};

function s3Configured(): boolean {
  return (provider === "s3" || provider === "r2") && Boolean(bucket && endpoint && accessKeyId && secretAccessKey);
}

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
      forcePathStyle: true // R2 + MinIO friendly
    });
  }
  return client;
}

/**
 * Upload a rendered file to object storage (R2/S3) and return its public URL.
 * Falls back to a local path when storage isn't configured (dev/scaffolding).
 */
export async function uploadRender(localPath: string, key: string): Promise<string> {
  if (!s3Configured()) {
    return `/render-output/${key}`;
  }

  const body = await readFile(localPath);
  const extension = key.split(".").pop() ?? "";
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: CONTENT_TYPES[extension] ?? "application/octet-stream"
    })
  );

  const base = (publicBase ?? `${endpoint}/${bucket}`).replace(/\/$/, "");
  return `${base}/${key}`;
}
