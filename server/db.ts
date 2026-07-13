// Unused: superseded by server/prisma.ts (Prisma + @prisma/adapter-pg). Kept, commented out, per team request rather than deleted.
// import { Pool } from "pg";
//
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });
//
// export async function query<T = unknown>(text: string, params: unknown[] = []) {
//   const result = await pool.query<T>(text, params);
//   return result.rows;
// }
//
// export async function closePool() {
//   await pool.end();
// }
