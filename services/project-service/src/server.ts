import dotenv from "dotenv";

dotenv.config();

import pool from "./config/database";
import Fastify from "fastify";
import cors from "@fastify/cors";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import teamRoutes from "./routes/teamRoutes";
import projectMemberRoutes from "./routes/projectMemberRoutes";
import projectDashboardRoutes from "./routes/projectDashboardRoutes";



const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
 allowedHeaders: ["Content-Type", "Authorization"],
});

app.register(projectRoutes, {
  prefix: "/projects",
});

app.register(taskRoutes, {
  prefix: "/tasks",
});

app.register(teamRoutes, {
  prefix: "/team",
});

app.register(projectMemberRoutes, {
  prefix: "/project-members",
});

app.register(projectDashboardRoutes, {
  prefix: "/project-dashboard",
});

app.get("/", async () => {
  return {
    message: "Project Service is running!",
  };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 5001;

    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected successfully");

    await app.listen({
      port,
      host: "0.0.0.0",
    });

    console.log(`Project Service running on port ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();