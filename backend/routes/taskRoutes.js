const express = require("express");

const {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const router = express.Router();

router.post("/projects/:projectId/tasks", createTask);

router.get("/projects/:projectId/tasks", getTasksByProject);

router.get("/tasks/:id", getTaskById);

router.put("/tasks/:id", updateTask);

router.delete("/tasks/:id", deleteTask);

module.exports = router;