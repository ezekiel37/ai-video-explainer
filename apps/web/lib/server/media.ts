import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { HttpError } from "./http";

export function byteRange(header: string | null, size: number): { start: number; end: number } | null {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) throw new HttpError(416, "Unsupported byte range.");
  const suffix = !match[1];
  const start = suffix ? Math.max(0, size - Number(match[2])) : Number(match[1]);
  const end = suffix || !match[2] ? size - 1 : Math.min(size - 1, Number(match[2]));
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size || start < 0) throw new HttpError(416, "Byte range is outside this file.");
  return { start, end };
}
export async function mediaResponse(key: string, request: Request) {
  if (!/^[a-f0-9-]+\.(mp4|gif)$/.test(key)) throw new HttpError(404, "Media not found.");
  const headers = new Headers({ "Content-Type": key.endsWith('.gif') ? 'image/gif' : 'video/mp4',
    "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes",
    "Content-Disposition": `${new URL(request.url).searchParams.has('download') ? 'attachment' : 'inline'}; filename="explainmotion.${key.split('.').pop()}"` });
  const range = request.headers.get('range');
  if ((process.env.STORAGE_PROVIDER ?? 'local') === 'local') {
    const filename = path.join(process.env.RENDER_OUTPUT_DIR ?? path.resolve('render-output'), key);
    const info = await stat(filename).catch(() => { throw new HttpError(404, "The video file is unavailable. Please render this project again."); });
    let selected;
    try { selected = byteRange(range, info.size); }
    catch { return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${info.size}` } }); }
    if (selected) headers.set('Content-Range', `bytes ${selected.start}-${selected.end}/${info.size}`);
    headers.set('Content-Length', String(selected ? selected.end - selected.start + 1 : info.size));
    return new Response(Readable.toWeb(createReadStream(filename, selected ?? undefined)) as ReadableStream, { status: selected ? 206 : 200, headers });
  }
  const { STORAGE_BUCKET: bucket, STORAGE_ENDPOINT: endpoint, STORAGE_ACCESS_KEY: accessKeyId, STORAGE_SECRET_KEY: secretAccessKey } = process.env;
  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) throw new HttpError(503, "Media storage is not configured.");
  if (range && !/^bytes=(\d*)-(\d*)$/.test(range)) throw new HttpError(416, 'Unsupported byte range.');
  const client = new S3Client({ region: process.env.STORAGE_REGION ?? 'auto', endpoint, credentials: { accessKeyId, secretAccessKey }, forcePathStyle: true });
  try {
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: range ?? undefined }));
    if (!result.Body) throw new HttpError(404, 'Media not found.');
    if (result.ContentLength !== undefined) headers.set('Content-Length', String(result.ContentLength));
    if (result.ContentRange) headers.set('Content-Range', result.ContentRange);
    return new Response(result.Body.transformToWebStream(), { status: result.ContentRange ? 206 : 200, headers });
  } catch (error) {
    if (error instanceof Error && error.name === 'NoSuchKey') throw new HttpError(404, 'The video file is unavailable. Please render again.');
    if (error instanceof Error && error.name === 'InvalidRange') throw new HttpError(416, 'Byte range is outside this file.');
    throw error;
  }
}
