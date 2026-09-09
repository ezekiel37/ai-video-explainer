import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./lib/server/db/schema.ts", "./lib/server/db/auth-schema.ts"],
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://explainmotion:explainmotion@localhost:5432/explainmotion"
  }
});
