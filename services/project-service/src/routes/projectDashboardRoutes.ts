import {
  getProjectDashboard,
} from "../controllers/projectDashboardController";

export default async function projectDashboardRoutes(app: any) {
  app.get("/:projectId", getProjectDashboard);
}