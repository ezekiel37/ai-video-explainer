import { z } from "zod";
import { createProject, listProjects } from "@/lib/server/store";
import { requireUser } from "@/lib/server/access";
import { errorResponse } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const bodySchema = z.object({ title: z.string().trim().min(1).max(120), prompt: z.string().trim().min(1).max(20000), sourceType: z.enum(["prompt", "import"]).default("prompt") });
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = bodySchema.parse(await request.json());
    const project = await createProject({ ...body, userId: user.id });
    return Response.json(project, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
export async function GET(request: Request) {
  try { const user = await requireUser(request); return Response.json(await listProjects(user.id)); }
  catch (error) { return errorResponse(error); }
}
