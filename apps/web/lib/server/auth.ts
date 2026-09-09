import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import { account, session, user, verification } from "./db/auth-schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-me",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification }
  }),
  emailAndPassword: {
    enabled: true
  }
});
