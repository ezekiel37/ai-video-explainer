import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client";

/** Apply pending Drizzle migrations from ./drizzle. Run with `pnpm db:migrate`. */
async function main() {
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("migrations applied");
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
