import { seedDemoProject } from "../store";
import { pool } from "./client";

/** Seed the demo project. Run with `pnpm db:seed`. */
async function main() {
  await seedDemoProject();
  console.log("demo project seeded");
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
