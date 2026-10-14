import pool from "../config/database";

// Get all team members
export const getTeamMembers = async (
  request: any,
  reply: any
) => {
  try {
    const userId = request.user?.userId;

if (!userId) {
  return reply.status(401).send({
    message: "User authentication required",
  });
}

const result = await pool.query(
  `SELECT DISTINCT tm.*
   FROM team_members tm
   INNER JOIN project_members pm
     ON pm.team_member_id = tm.id
   INNER JOIN projects p
     ON p.id = pm.project_id
   WHERE p.user_id = $1
   ORDER BY tm.id ASC`,
  [userId]
);

    return reply.status(200).send({
      teamMembers: result.rows,
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to fetch team members",
    });
  }
};

// Add a team member
export const createTeamMember = async (
  request: any,
  reply: any
) => {
  try {
    const { name, email, role } = request.body;

    if (!name) {
      return reply.status(400).send({
        message: "Name is required",
      });
    }

    if (!email) {
      return reply.status(400).send({
        message: "Email is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO team_members
       (name, email, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        name,
        email,
        role || "Member",
      ]
    );

    return reply.status(201).send({
      message: "Team member added successfully",
      teamMember: result.rows[0],
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "23505") {
      return reply.status(409).send({
        message: "A team member with this email already exists",
      });
    }

    return reply.status(500).send({
      message: "Failed to add team member",
    });
  }
};