import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("Auth service connected to PostgreSQL");
});

pool.on("error", (error) => {
  console.error("PostgreSQL connection error:", error);
});

export default pool;