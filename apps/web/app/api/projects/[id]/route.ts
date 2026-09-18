import { z } from "zod";
import { requireProject, requireUser } from "@/lib/server/access";
import { latestRender } from "@/lib/server/renders";
import { errorResponse } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const id = z.string().uuid().parse((await params).id);
    const project = await requireProject(id, user.id);
    return Response.json({ ...project, latestRender: await latestRender(id, user.id) });
  } catch (error) { return errorResponse(error); }
}
