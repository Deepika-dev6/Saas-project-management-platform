import pool from "../config/database";

// Get team members assigned to a project
export const getProjectMembers = async (
  request: any,
  reply: any
) => {
  try {
    const { projectId } = request.params;

    const result = await pool.query(
      `SELECT
         tm.id,
         tm.name,
         tm.email,
         tm.role,
         pm.created_at
       FROM project_members pm
       JOIN team_members tm
         ON pm.team_member_id = tm.id
       WHERE pm.project_id = $1
       ORDER BY tm.name ASC`,
      [projectId]
    );

    return reply.status(200).send({
      projectMembers: result.rows,
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to fetch project members",
    });
  }
};

// Add a team member to a project
export const addProjectMember = async (
  request: any,
  reply: any
) => {
  try {
    const { projectId, teamMemberId } = request.body;

    if (!projectId) {
      return reply.status(400).send({
        message: "Project ID is required",
      });
    }

    if (!teamMemberId) {
      return reply.status(400).send({
        message: "Team member ID is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO project_members
       (project_id, team_member_id)
       VALUES ($1, $2)
       RETURNING *`,
      [projectId, teamMemberId]
    );

    return reply.status(201).send({
      message: "Team member added to project successfully",
      projectMember: result.rows[0],
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "23505") {
      return reply.status(409).send({
        message: "This team member is already assigned to the project",
      });
    }

    if (error.code === "23503") {
      return reply.status(400).send({
        message: "Project or team member does not exist",
      });
    }

    return reply.status(500).send({
      message: "Failed to add team member to project",
    });
  }
};

// Remove a team member from a project
export const removeProjectMember = async (
  request: any,
  reply: any
) => {
  try {
    const { projectId, teamMemberId } = request.params;

    const result = await pool.query(
      `DELETE FROM project_members
       WHERE project_id = $1
       AND team_member_id = $2
       RETURNING *`,
      [projectId, teamMemberId]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({
        message: "Project member not found",
      });
    }

    return reply.status(200).send({
      message: "Team member removed from project",
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to remove team member from project",
    });
  }
};