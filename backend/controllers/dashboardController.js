const db = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    // Total projects
    const [projectResult] = await db.execute(
      "SELECT COUNT(*) AS total_projects FROM projects"
    );

    // Total tasks
    const [taskResult] = await db.execute(
      "SELECT COUNT(*) AS total_tasks FROM tasks"
    );

    // Pending tasks
    const [pendingResult] = await db.execute(
      "SELECT COUNT(*) AS pending_tasks FROM tasks WHERE status != 'COMPLETED'"
    );

    // Completed tasks
    const [completedResult] = await db.execute(
      "SELECT COUNT(*) AS completed_tasks FROM tasks WHERE status = 'COMPLETED'"
    );

    // Recent projects
    const [recentProjects] = await db.execute(`
      SELECT
        p.id,
        p.name,
        p.description,
        COUNT(t.id) AS task_count,
        COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) AS completed_tasks
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    res.status(200).json({
      success: true,
      data: {
        total_projects: projectResult[0].total_projects,
        total_tasks: taskResult[0].total_tasks,
        pending_tasks: pendingResult[0].pending_tasks,
        completed_tasks: completedResult[0].completed_tasks,
        recent_projects: recentProjects,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getDashboardStats,
};