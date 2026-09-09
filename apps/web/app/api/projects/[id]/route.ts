import { z } from "zod";
import { getProject } from "@/lib/server/store";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    z.string().uuid().parse(id);
    const project = await getProject(id);
    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }
    return Response.json(project);
  } catch (error) {
    return errorResponse(error);
  }
}
