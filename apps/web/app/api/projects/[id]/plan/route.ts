import { z } from "zod";
import { generateMockSceneGraph } from "@explainmotion/ai";
import { sceneGraphSchema } from "@explainmotion/schema";
import { requireProject, requireUser } from "@/lib/server/access";
import { updateProject } from "@/lib/server/store";
import { errorResponse } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const bodySchema = z.object({ version: z.number().int().positive(), prompt: z.string().trim().min(10).max(20000) });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const id = z.string().uuid().parse((await params).id);
    await requireProject(id, user.id);
    const body = bodySchema.parse(await request.json());
    const sceneGraph = sceneGraphSchema.parse(generateMockSceneGraph(id, body.prompt));
    return Response.json(await updateProject(id, user.id, body.version, { sceneGraph, title: sceneGraph.title, prompt: body.prompt, sourceType: "prompt" }));
  } catch (error) { return errorResponse(error); }
}
