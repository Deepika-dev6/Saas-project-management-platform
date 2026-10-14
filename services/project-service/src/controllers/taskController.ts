import pool from "../config/database";

// =========================================
// CREATE TASK
// =========================================

export const createTask = async (
  request: any,
  reply: any
) => {
  try {
    const {
      projectId,
      title,
      description,
      status,
      priority,
      assignee,
      startDate,
      dueDate,
    } = request.body;

    if (!projectId) {
      return reply.status(400).send({
        message: "Project ID is required",
      });
    }

    if (!title) {
      return reply.status(400).send({
        message: "Task title is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks
       (
         project_id,
         title,
         description,
         status,
         priority,
         assignee,
         start_date,
         due_date
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        projectId,
        title,
        description || "",
        status || "To Do",
        priority || "Medium",
        assignee || "",
        startDate || null,
        dueDate || null,
      ]
    );

    return reply.status(201).send({
      message: "Task created successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to create task",
    });
  }
};


// =========================================
// GET TASKS BY PROJECT
// =========================================

export const getTasksByProject = async (
  request: any,
  reply: any
) => {
  try {
    const { projectId } = request.params;

    const result = await pool.query(
      `SELECT *
       FROM tasks
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [projectId]
    );

    return reply.status(200).send({
      tasks: result.rows,
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to fetch tasks",
    });
  }
};


// =========================================
// UPDATE TASK
// =========================================

export const updateTask = async (
  request: any,
  reply: any
) => {
  try {
    const { id } = request.params;

    const {
      title,
      description,
      status,
      priority,
      assignee,
      startDate,
      dueDate,
    } = request.body;

    if (!title) {
      return reply.status(400).send({
        message: "Task title is required",
      });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET
         title = $1,
         description = $2,
         status = $3,
         priority = $4,
         assignee = $5,
         start_date = $6,
         due_date = $7,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        title,
        description || "",
        status || "To Do",
        priority || "Medium",
        assignee || "",
        startDate || null,
        dueDate || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({
        message: "Task not found",
      });
    }

    return reply.status(200).send({
      message: "Task updated successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to update task",
    });
  }
};


// =========================================
// DELETE TASK
// =========================================

export const deleteTask = async (
  request: any,
  reply: any
) => {
  try {
    const { id } = request.params;

    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({
        message: "Task not found",
      });
    }

    return reply.status(200).send({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to delete task",
    });
  }
};