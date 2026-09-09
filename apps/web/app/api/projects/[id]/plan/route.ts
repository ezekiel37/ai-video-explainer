import { z } from "zod";
import { generateMockSceneGraph } from "@explainmotion/ai";
import { getProject, updateProject } from "@/lib/server/store";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    z.string().uuid().parse(id);
    const project = await getProject(id);
    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }

    const sceneGraph = generateMockSceneGraph(project.id, project.prompt);
    await updateProject(project.id, { status: "planned", sceneGraph });

    return Response.json({ projectId: project.id, sceneGraph });
  } catch (error) {
    return errorResponse(error);
  }
}
