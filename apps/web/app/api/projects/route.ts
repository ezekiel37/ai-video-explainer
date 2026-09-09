import { z } from "zod";
import { createProject } from "@/lib/server/store";
import { auth } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createProjectBodySchema = z.object({
  title: z.string().min(1),
  prompt: z.string().min(10),
  format: z.literal("landscape").default("landscape"),
  style: z.literal("minimal-tech").default("minimal-tech")
});

export async function POST(request: Request) {
  try {
    const body = createProjectBodySchema.parse(await request.json());
    const session = await auth.api.getSession({ headers: request.headers });
    const project = await createProject({ ...body, userId: session?.user?.id ?? null });
    return Response.json({ projectId: project.id, status: project.status }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
