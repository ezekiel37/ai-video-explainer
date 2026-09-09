import { z } from "zod";
import { sceneGraphSchema } from "@explainmotion/schema";
import { getProject, updateProject } from "@/lib/server/store";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    z.string().uuid().parse(id);
    const project = await getProject(id);
    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }

    const sceneGraph = sceneGraphSchema.parse(await request.json());
    await updateProject(id, { sceneGraph });

    return Response.json({ projectId: id, sceneGraph });
  } catch (error) {
    return errorResponse(error);
  }
}
