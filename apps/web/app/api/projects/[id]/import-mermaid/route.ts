import { z } from "zod";
import { contentToSceneGraph } from "@explainmotion/ai";
import { requireProject, requireUser } from "@/lib/server/access";
import { updateProject } from "@/lib/server/store";
import { errorResponse, HttpError } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const bodySchema = z.object({ version: z.number().int().positive(), diagram: z.string().trim().min(1).max(20000) });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const id = z.string().uuid().parse((await params).id);
    await requireProject(id, user.id);
    const body = bodySchema.parse(await request.json());
    let sceneGraph;
    try { sceneGraph = contentToSceneGraph(id, body.diagram); }
    catch (error) { throw new HttpError(400, error instanceof Error ? error.message : "Unsupported input."); }
    return Response.json(await updateProject(id, user.id, body.version, { sceneGraph, title: sceneGraph.title, prompt: body.diagram, sourceType: "import" }));
  } catch (error) { return errorResponse(error); }
}
