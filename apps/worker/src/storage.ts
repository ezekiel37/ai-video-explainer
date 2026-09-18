import { readFile } from "node:fs/promises";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/** Store private media. Downloads go through the owner-checked web endpoint. */
export async function uploadRender(localPath: string, key: string): Promise<string> {
  const provider = process.env.STORAGE_PROVIDER ?? "local";
  if (provider === "local") return key;
  if (!["r2", "s3"].includes(provider)) throw new Error("Unsupported STORAGE_PROVIDER");
  const { STORAGE_BUCKET: bucket, STORAGE_ENDPOINT: endpoint, STORAGE_ACCESS_KEY: accessKeyId, STORAGE_SECRET_KEY: secretAccessKey } = process.env;
  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) throw new Error("Object storage configuration is incomplete.");
  const client = new S3Client({ region: process.env.STORAGE_REGION ?? "auto", endpoint, credentials: { accessKeyId, secretAccessKey }, forcePathStyle: true });
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: await readFile(localPath), ContentType: key.endsWith(".gif") ? "image/gif" : "video/mp4" }));
  return key;
}
