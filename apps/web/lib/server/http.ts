import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) return Response.json({ message: error.message }, { status: error.status });
  if (error instanceof ZodError) return Response.json({ message: "Please correct the invalid fields.", issues: error.issues }, { status: 400 });
  if (error instanceof SyntaxError) return Response.json({ message: "Invalid JSON request." }, { status: 400 });
  console.error(error);
  return Response.json({ message: "The request could not be completed. Your edits are still in the editor." }, { status: 500 });
}
