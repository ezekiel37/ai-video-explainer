export function authConfiguration(env: NodeJS.ProcessEnv = process.env) {
  const secret = env.BETTER_AUTH_SECRET;
  const baseURL = env.BETTER_AUTH_URL;
  if (env.NODE_ENV === "production") {
    if (!secret || secret.length < 32 || new Set(secret).size < 12 || ["dev-secret-change-me", "development-only-secret-do-not-deploy"].includes(secret)) {
      throw new Error("Set a randomly generated BETTER_AUTH_SECRET of at least 32 characters.");
    }
    if (!baseURL || !/^https?:\/\//.test(baseURL)) throw new Error("Set BETTER_AUTH_URL to the application origin.");
  }
  return { secret: secret || "development-only-secret-do-not-deploy", baseURL: baseURL || "http://localhost:3000" };
}
