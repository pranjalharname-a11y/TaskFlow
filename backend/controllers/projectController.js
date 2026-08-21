const db = require("../config/db");

const createProject = async (req, res) => {
  try {
    const { name, description, created_by } = req.body;

    // Validate required field
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    // Check that the user exists
    const [users] = await db.execute(
      "SELECT id FROM users WHERE id = ?",
      [created_by]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user",
      });
    }

    // Insert project
    const [result] = await db.execute(
      "INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)",
      [name.trim(), description || null, created_by]
    );

    // Return created project
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: {
        id: result.insertId,
        name: name.trim(),
        description: description || null,
        created_by,
      },
    });
  } catch (error) {
  console.error("Create project error:", error);

  res.status(500).json({
    success: false,
    message: error.message,
  });
  }
};

const getProjects = async (req, res) => {
  try {
    const [projects] = await db.execute(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.created_by,
        p.created_at,
        p.updated_at,
        COUNT(t.id) AS task_count,
        COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) AS completed_tasks
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const [projects] = await db.execute(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.created_by,
        p.created_at,
        p.updated_at,
        COUNT(t.id) AS task_count,
        COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) AS completed_tasks
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = ?
      GROUP BY p.id
      `,
      [id]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: projects[0],
    });
  } catch (error) {
    console.error("Get project error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Validate project name
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    // Check if project exists
    const [existingProjects] = await db.execute(
      "SELECT id FROM projects WHERE id = ?",
      [id]
    );

    if (existingProjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Update project
    await db.execute(
      `
      UPDATE projects
      SET name = ?, description = ?
      WHERE id = ?
      `,
      [name.trim(), description || null, id]
    );

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: {
        id: Number(id),
        name: name.trim(),
        description: description || null,
      },
    });
  } catch (error) {
    console.error("Update project error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const [existingProjects] = await db.execute(
      "SELECT id FROM projects WHERE id = ?",
      [id]
    );

    if (existingProjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Delete project
    await db.execute(
      "DELETE FROM projects WHERE id = ?",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};