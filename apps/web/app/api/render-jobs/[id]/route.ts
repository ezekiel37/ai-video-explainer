import { getRenderJobSnapshot } from "@/lib/server/queue";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const job = await getRenderJobSnapshot(id);
    if (!job) {
      return Response.json({ message: "Render job not found" }, { status: 404 });
    }
    return Response.json(job);
  } catch (error) {
    return errorResponse(error);
  }
}
