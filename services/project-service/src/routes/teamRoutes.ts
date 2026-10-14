import {
  getTeamMembers,
  createTeamMember,
} from "../controllers/teamController";

import { authenticate } from "../middleware/authMiddleware";

export default async function teamRoutes(app: any) {
  // Get all team members
  app.get(
    "/",
    { preHandler: authenticate },
    getTeamMembers
  );

  // Add a team member
  app.post(
    "/",
    { preHandler: authenticate },
    createTeamMember
  );
}