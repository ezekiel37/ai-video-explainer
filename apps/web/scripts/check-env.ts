import { authConfiguration } from "../lib/server/auth-config";
// Called only by production start scripts, even when NODE_ENV is initially unset.
authConfiguration({ ...process.env, NODE_ENV: "production" });
if (!process.env.DATABASE_URL || !process.env.REDIS_URL) {
  throw new Error("Set DATABASE_URL and REDIS_URL before starting the application.");
}
const provider = process.env.STORAGE_PROVIDER ?? "local";
if (!["local", "r2", "s3"].includes(provider)) throw new Error("STORAGE_PROVIDER must be local, r2, or s3.");
if (provider !== "local" && ["STORAGE_BUCKET", "STORAGE_ENDPOINT", "STORAGE_ACCESS_KEY", "STORAGE_SECRET_KEY"].some(key => !process.env[key])) {
  throw new Error("Configure all STORAGE_* credentials for private object storage.");
}
if (provider === "local" && !process.env.RENDER_OUTPUT_DIR?.startsWith("/")) {
  throw new Error("Set RENDER_OUTPUT_DIR to an absolute directory shared by web and worker.");
}
