import { z } from "zod";
import { requireRenderJob, requireUser } from "@/lib/server/access";
import { mediaResponse } from "@/lib/server/media";
import { errorResponse, HttpError } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const id = z.string().uuid().parse((await params).id);
    const job = await requireRenderJob(id, user.id);
    if (job.status !== 'completed' || !job.outputKey) throw new HttpError(409, 'This video is not ready to download.');
    return await mediaResponse(job.outputKey, request);
  } catch (error) { return errorResponse(error); }
}
