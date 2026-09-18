import { z } from "zod";
import { sceneGraphSchema } from "@explainmotion/schema";
import { requireProject, requireUser } from "@/lib/server/access";
import { updateProject } from "@/lib/server/store";
import { errorResponse, HttpError } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const bodySchema = z.object({ version: z.number().int().positive(), sceneGraph: sceneGraphSchema, prompt: z.string().min(1).max(20000), sourceType: z.enum(["prompt", "import"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const id = z.string().uuid().parse((await params).id);
    await requireProject(id, user.id);
    const body = bodySchema.parse(await request.json());
    if (body.sceneGraph.projectId !== id) throw new HttpError(400, "The scene graph belongs to a different project.");
    return Response.json(await updateProject(id, user.id, body.version, { sceneGraph: body.sceneGraph, title: body.sceneGraph.title, prompt: body.prompt, sourceType: body.sourceType }));
  } catch (error) { return errorResponse(error); }
}
