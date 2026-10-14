import * as dotenv from "dotenv";

dotenv.config();

import Fastify from "fastify";
import cors from "@fastify/cors";
import pool from "./config/database";
import authRoutes from "./routes/authRoutes";

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

app.get("/", async () => {
  return {
    message: "Auth Service is running!",
  };
});

app.register(authRoutes, {
  prefix: "/auth",
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 5002;

    await pool.query("SELECT NOW()");

    console.log("PostgreSQL connected successfully");

    await app.listen({
      port,
      host: "0.0.0.0",
    });

    console.log(`Auth Service running on port ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();