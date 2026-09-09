import { z } from "zod";
import { getProject, updateProject } from "@/lib/server/store";
import { enqueueRender } from "@/lib/server/queue";
import { auth } from "@/lib/server/auth";
import { getEntitlement } from "@/lib/server/entitlements";
import { recordRender, rendersThisMonth } from "@/lib/server/usage";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const renderBodySchema = z
  .object({
    format: z.enum(["mp4", "gif"]).optional(),
    orientation: z.enum(["landscape", "portrait"]).optional()
  })
  .default({});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    z.string().uuid().parse(id);
    const project = await getProject(id);
    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }
    if (!project.sceneGraph) {
      return Response.json({ message: "Project has no scene graph. Plan it first." }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id ?? null;
    const entitlement = getEntitlement(userId);

    // Enforce the free-tier monthly cap (only trackable for signed-in users).
    if (userId && entitlement.monthlyVideoLimit !== null) {
      const used = await rendersThisMonth(userId);
      if (used >= entitlement.monthlyVideoLimit) {
        return Response.json(
          { message: `Free plan limit reached (${entitlement.monthlyVideoLimit}/month). Upgrade to keep rendering.`, plan: entitlement.plan },
          { status: 402 }
        );
      }
    }

    const body = renderBodySchema.parse(await request.json().catch(() => ({})));
    const format = body.format ?? "mp4";
    const orientation = body.orientation ?? "landscape";

    const jobId = await enqueueRender({
      projectId: project.id,
      sceneGraph: project.sceneGraph,
      format,
      orientation,
      watermark: entitlement.watermark,
      notifyEmail: session?.user?.email
    });

    await updateProject(project.id, { status: "rendering" });
    await recordRender({ userId, projectId: project.id, format, orientation });

    return Response.json({ jobId, status: "queued", watermark: entitlement.watermark }, { status: 202 });
  } catch (error) {
    return errorResponse(error);
  }
}
