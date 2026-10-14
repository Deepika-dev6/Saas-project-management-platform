import {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
} from "../controllers/taskController";

export default async function taskRoutes(app: any) {

  // Create a task
  app.post("/", createTask);

  // Get all tasks for a project
  app.get(
    "/project/:projectId",
    getTasksByProject
  );

  // Update a task
  app.put("/:id", updateTask);

  // Delete a task
  app.delete("/:id", deleteTask);
}