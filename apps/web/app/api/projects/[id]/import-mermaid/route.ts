import { z } from "zod";
import { contentToSceneGraph } from "@explainmotion/ai";
import { getProject, updateProject } from "@/lib/server/store";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ diagram: z.string().min(1) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    z.string().uuid().parse(id);
    const project = await getProject(id);
    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }

    const { diagram } = bodySchema.parse(await request.json());
    let sceneGraph;
    try {
      sceneGraph = contentToSceneGraph(project.id, diagram);
    } catch (parseError) {
      return Response.json({ message: (parseError as Error).message }, { status: 400 });
    }

    await updateProject(project.id, { status: "planned", sceneGraph, title: sceneGraph.title });
    return Response.json({ projectId: project.id, sceneGraph });
  } catch (error) {
    return errorResponse(error);
  }
}
