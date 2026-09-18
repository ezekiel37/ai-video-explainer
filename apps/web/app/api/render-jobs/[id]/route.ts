import { z } from "zod";
import { requireRenderJob, requireUser } from "@/lib/server/access";
import { jobSnapshot } from "@/lib/server/renders";
import { errorResponse } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const id = z.string().uuid().parse((await params).id);
    return Response.json(jobSnapshot(await requireRenderJob(id, user.id)));
  } catch (error) { return errorResponse(error); }
}
