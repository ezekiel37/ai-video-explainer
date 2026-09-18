import { z } from "zod";
import { requireUser } from "@/lib/server/access";
import { reserveRender, jobSnapshot } from "@/lib/server/renders";
import { enqueueRender } from "@/lib/server/queue";
import { errorResponse } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const bodySchema = z.object({ requestId: z.string().uuid(), version: z.number().int().positive(), format: z.enum(["mp4", "gif"]).default("mp4"), orientation: z.enum(["landscape", "portrait"]).default("landscape") });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const id = z.string().uuid().parse((await params).id);
    const body = bodySchema.parse(await request.json());
    const job = await reserveRender(user.id, id, body);
    // The committed job is an outbox entry. Worker reconciliation dispatches it
    // after Redis outages, without requiring a second reservation or charge.
    if (job.status === "queued") await enqueueRender(job.id).catch(error => console.error("Render dispatch deferred:", error));
    return Response.json(jobSnapshot(job), { status: 202 });
  } catch (error) { return errorResponse(error); }
}
