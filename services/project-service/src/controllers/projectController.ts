import pool from "../config/database";

// Create a project
export const createProject = async (request: any, reply: any) => {
  try {
    const {
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
    } = request.body;

    const userId = request.user?.userId;

    if (!userId) {
      return reply.status(401).send({
        message: "User authentication required",
      });
    }

    if (!name) {
      return reply.status(400).send({
        message: "Project name is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO projects
       (name, description, status, priority, start_date, due_date, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        description || "",
        status || "active",
        priority || "medium",
        startDate || null,
        dueDate || null,
        userId,
      ]
    );

    return reply.status(201).send({
      message: "Project created successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to create project",
    });
  }
};

// Get only the logged-in user's projects
export const getProjects = async (request: any, reply: any) => {
  try {
    const userId = request.user?.userId;

    if (!userId) {
      return reply.status(401).send({
        message: "User authentication required",
      });
    }

    const result = await pool.query(
      `SELECT * FROM projects
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return reply.status(200).send({
      projects: result.rows,
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to fetch projects",
    });
  }
};

// Get one project only if it belongs to the logged-in user
export const getProjectById = async (request: any, reply: any) => {
  try {
    const { id } = request.params;
    const userId = request.user?.userId;

    if (!userId) {
      return reply.status(401).send({
        message: "User authentication required",
      });
    }

    const result = await pool.query(
      `SELECT * FROM projects
       WHERE id = $1
       AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({
        message: "Project not found",
      });
    }

    return reply.status(200).send({
      project: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to fetch project",
    });
  }
};

// Update a project only if it belongs to the logged-in user
export const updateProject = async (request: any, reply: any) => {
  try {
    const { id } = request.params;

    const {
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
    } = request.body;

    const userId = request.user?.userId;

    if (!userId) {
      return reply.status(401).send({
        message: "User authentication required",
      });
    }

    if (!name) {
      return reply.status(400).send({
        message: "Project name is required",
      });
    }

    const result = await pool.query(
      `UPDATE projects
       SET
         name = $1,
         description = $2,
         status = $3,
         priority = $4,
         start_date = $5,
         due_date = $6
       WHERE id = $7
       AND user_id = $8
       RETURNING *`,
      [
        name,
        description || "",
        status || "active",
        priority || "medium",
        startDate || null,
        dueDate || null,
        id,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({
        message: "Project not found",
      });
    }

    return reply.status(200).send({
      message: "Project updated successfully",
      project: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to update project",
    });
  }
};

// Delete a project only if it belongs to the logged-in user
export const deleteProject = async (request: any, reply: any) => {
  try {
    const { id } = request.params;
    const userId = request.user?.userId;

    if (!userId) {
      return reply.status(401).send({
        message: "User authentication required",
      });
    }

    const result = await pool.query(
      `DELETE FROM projects
       WHERE id = $1
       AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({
        message: "Project not found",
      });
    }

    return reply.status(200).send({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to delete project",
    });
  }
};