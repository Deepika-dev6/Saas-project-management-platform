import {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from "../controllers/projectMemberController";

export default async function projectMemberRoutes(app: any) {
  // Get members assigned to a project
  app.get("/project/:projectId", getProjectMembers);

  // Add a member to a project
  app.post("/", addProjectMember);

  // Remove a member from a project
  app.delete(
    "/project/:projectId/member/:teamMemberId",
    removeProjectMember
  );
}