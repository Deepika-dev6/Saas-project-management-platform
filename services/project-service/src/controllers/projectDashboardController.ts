import pool from "../config/database";

export const getProjectDashboard = async (
  request: any,
  reply: any
) => {
  try {
    const { projectId } = request.params;

    // Check whether project exists
    const projectResult = await pool.query(
      `SELECT id, name
       FROM projects
       WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return reply.status(404).send({
        message: "Project not found",
      });
    }

    // Get task statistics
    const taskResult = await pool.query(
      `SELECT
         COUNT(*)::int AS total_tasks,
         COUNT(*) FILTER (WHERE status = 'To Do')::int AS todo_tasks,
         COUNT(*) FILTER (WHERE status = 'In Progress')::int AS in_progress_tasks,
         COUNT(*) FILTER (WHERE status = 'Completed')::int AS completed_tasks,
         COUNT(*) FILTER (WHERE status = 'On Hold')::int AS on_hold_tasks
       FROM tasks
       WHERE project_id = $1`,
      [projectId]
    );

    // Get project member count
    const memberResult = await pool.query(
      `SELECT COUNT(*)::int AS total_members
       FROM project_members
       WHERE project_id = $1`,
      [projectId]
    );

    return reply.status(200).send({
      project: projectResult.rows[0],
      statistics: {
        totalTasks: taskResult.rows[0].total_tasks,
        todoTasks: taskResult.rows[0].todo_tasks,
        inProgressTasks: taskResult.rows[0].in_progress_tasks,
        completedTasks: taskResult.rows[0].completed_tasks,
        onHoldTasks: taskResult.rows[0].on_hold_tasks,
        totalMembers: memberResult.rows[0].total_members,
      },
    });
  } catch (error) {
    console.error(error);

    return reply.status(500).send({
      message: "Failed to fetch project dashboard",
    });
  }
};