const db = require("../config/db");

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;

    const {
      title,
      description,
      status,
      priority,
      due_date,
      assigned_to,
    } = req.body;

    // Validate required fields
    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Task status is required",
      });
    }

    if (!priority) {
      return res.status(400).json({
        success: false,
        message: "Task priority is required",
      });
    }

    // Validate status
    const validStatuses = ["TODO", "IN_PROGRESS", "COMPLETED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    // Validate priority
    const validPriorities = ["LOW", "MEDIUM", "HIGH"];

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    // Check if project exists
    const [projects] = await db.execute(
      "SELECT id FROM projects WHERE id = ?",
      [projectId]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check assigned user if provided
    if (assigned_to) {
      const [users] = await db.execute(
        "SELECT id FROM users WHERE id = ?",
        [assigned_to]
      );

      if (users.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid assigned user",
        });
      }
    }

    // Create task
    const [result] = await db.execute(
      `
      INSERT INTO tasks
      (project_id, title, description, status, priority, due_date, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        projectId,
        title.trim(),
        description || null,
        status,
        priority,
        due_date || null,
        assigned_to || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: {
        id: result.insertId,
        project_id: Number(projectId),
        title: title.trim(),
        description: description || null,
        status,
        priority,
        due_date: due_date || null,
        assigned_to: assigned_to || null,
      },
    });
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { search, status, priority } = req.query;

    // Check if project exists
    const [projects] = await db.execute(
      "SELECT id FROM projects WHERE id = ?",
      [projectId]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    let query = `
      SELECT
        t.id,
        t.project_id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.assigned_to,
        u.name AS assigned_user,
        t.created_at,
        t.updated_at
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = ?
    `;

    const queryParams = [projectId];

    // Search by task title
    if (search) {
      query += " AND t.title LIKE ?";
      queryParams.push(`%${search}%`);
    }

    // Filter by status
    if (status) {
      query += " AND t.status = ?";
      queryParams.push(status);
    }

    // Filter by priority
    if (priority) {
      query += " AND t.priority = ?";
      queryParams.push(priority);
    }

    query += " ORDER BY t.created_at DESC";

    const [tasks] = await db.execute(query, queryParams);

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const [tasks] = await db.execute(
      `
      SELECT
        t.id,
        t.project_id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.assigned_to,
        u.name AS assigned_user,
        t.created_at,
        t.updated_at
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = ?
      `,
      [id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tasks[0],
    });
  } catch (error) {
    console.error("Get task error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      status,
      priority,
      due_date,
      assigned_to,
    } = req.body;

    // Validate required fields
    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (!status || !priority) {
      return res.status(400).json({
        success: false,
        message: "Status and priority are required",
      });
    }

    // Validate status
    const validStatuses = ["TODO", "IN_PROGRESS", "COMPLETED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    // Validate priority
    const validPriorities = ["LOW", "MEDIUM", "HIGH"];

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    // Check if task exists
    const [existingTasks] = await db.execute(
      "SELECT id FROM tasks WHERE id = ?",
      [id]
    );

    if (existingTasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check assigned user if provided
    if (assigned_to) {
      const [users] = await db.execute(
        "SELECT id FROM users WHERE id = ?",
        [assigned_to]
      );

      if (users.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid assigned user",
        });
      }
    }

    // Update task
    await db.execute(
      `
      UPDATE tasks
      SET
        title = ?,
        description = ?,
        status = ?,
        priority = ?,
        due_date = ?,
        assigned_to = ?
      WHERE id = ?
      `,
      [
        title.trim(),
        description || null,
        status,
        priority,
        due_date || null,
        assigned_to || null,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: {
        id: Number(id),
        title: title.trim(),
        description: description || null,
        status,
        priority,
        due_date: due_date || null,
        assigned_to: assigned_to || null,
      },
    });
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const [existingTasks] = await db.execute(
      "SELECT id FROM tasks WHERE id = ?",
      [id]
    );

    if (existingTasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Delete task
    await db.execute(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
};

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
};