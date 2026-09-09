import { ZodError } from "zod";

/** Uniform error responses for the API route handlers. */
export function errorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json({ message: "Invalid request", issues: error.issues }, { status: 400 });
  }
  console.error(error);
  return Response.json({ message: "Internal error" }, { status: 500 });
}
