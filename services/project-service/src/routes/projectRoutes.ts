import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController";

import { authenticate } from "../middleware/authMiddleware";

export default async function projectRoutes(app: any) {
  // Create a project
  app.post("/", { preHandler: authenticate }, createProject);

  // Get all projects
  app.get("/", { preHandler: authenticate }, getProjects);

  // Get one project by ID
  app.get("/:id", { preHandler: authenticate }, getProjectById);

  // Update a project
  app.put("/:id", { preHandler: authenticate }, updateProject);

  // Delete a project
  app.delete("/:id", { preHandler: authenticate }, deleteProject);
}