import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import { account, session, user, verification } from "./db/auth-schema";

import { authConfiguration } from "./auth-config";

function createAuth() {
  return betterAuth({
  ...authConfiguration(),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification }
  }),
  emailAndPassword: {
    enabled: true
  }
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  return instance ??= createAuth();
}
