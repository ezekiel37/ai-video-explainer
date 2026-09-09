import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as appSchema from "./schema";
import * as authSchema from "./auth-schema";

const schema = { ...appSchema, ...authSchema };

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://explainmotion:explainmotion@localhost:5432/explainmotion";

// Reuse a single Pool across hot reloads / route invocations.
const globalForDb = globalThis as unknown as { __emPool?: Pool };
export const pool = globalForDb.__emPool ?? new Pool({ connectionString });
if (!globalForDb.__emPool) globalForDb.__emPool = pool;

export const db = drizzle(pool, { schema });
