// src/pages/ProjectDetails.jsx
import EditTask from "../components/EditTask";
import "./ProjectDetails.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    due_date: "",
    assigned_to: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // -----------------------------
  // Fetch Project
  // -----------------------------
  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load project");
    }
  };

  // -----------------------------
  // Fetch Tasks
  // -----------------------------
  const fetchTasks = async () => {
    try {
      const response = await api.get(`/projects/${id}/tasks`);
      setTasks(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
    }
  };

  // -----------------------------
  // Load Page Data
  // -----------------------------
  const loadData = async () => {
    setLoading(true);
    setError("");

    await Promise.all([
      fetchProject(),
      fetchTasks(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // -----------------------------
  // Form Change
  // -----------------------------
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // -----------------------------
  // Reset Form
  // -----------------------------
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      due_date: "",
      assigned_to: 1,
    });

    setEditingTask(null);
    setShowForm(false);
  };

  // -----------------------------
  // Open Create Task
  // -----------------------------
  const openCreateTask = () => {
    setEditingTask(null);

    setForm({
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      due_date: "",
      assigned_to: 1,
    });

    setMessage("");
    setError("");
    setShowForm(true);
  };

  // -----------------------------
  // Open Edit Task
  // -----------------------------
  const openEditTask = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "TODO",
      priority: task.priority || "MEDIUM",
      due_date: task.due_date
        ? task.due_date.substring(0, 10)
        : "",
      assigned_to: task.assigned_to || 1,
    });

    setMessage("");
    setError("");
    setShowForm(true);
  };

  // -----------------------------
  // Create / Update Task
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setError("");
      setMessage("");

      const taskData = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        due_date: form.due_date || null,
        assigned_to: Number(form.assigned_to),
      };

      // Update existing task
      if (editingTask) {
        await api.put(
          `/tasks/${editingTask.id}`,
          taskData
        );

        setMessage("Task updated successfully");
      }

      // Create new task
      else {
        await api.post(
          `/projects/${id}/tasks`,
          taskData
        );

        setMessage("Task created successfully");
      }

      resetForm();

      // Reload tasks so the new/updated task appears
      await fetchTasks();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to save task"
      );
    }
  };

  // -----------------------------
  // Delete Task
  // -----------------------------
  const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(`/tasks/${taskId}`);

      setMessage("Task deleted successfully");

      await fetchTasks();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to delete task"
      );
    }
  };

  // -----------------------------
  // Filter Tasks
  // -----------------------------
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      task.status === statusFilter;

    const matchesPriority =
      !priorityFilter ||
      task.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  // -----------------------------
  // Loading
  // -----------------------------
  if (loading) {
    return (
      <div>
        <Navbar />

        <p style={{ padding: "30px" }}>
          Loading project...
        </p>
      </div>
    );
  }

  // -----------------------------
  // Project Not Found
  // -----------------------------
  if (!project) {
    return (
      <div>
        <Navbar />

        <p style={{ padding: "30px" }}>
          Project not found.
        </p>
      </div>
    );
  }

  // -----------------------------
  // Page
  // -----------------------------
  return (
    <div>
      <Navbar />

      <main style={{ padding: "30px" }}>

        {/* Back */}
        <Link to="/projects">
          ← Back to Projects
        </Link>

        {/* Project Header */}
        <div
          style={{
            marginTop: "20px",
            marginBottom: "30px",
          }}
        >
          <h1>{project.name}</h1>

          <p>
            {project.description ||
              "No description available"}
          </p>

          <p>
            <strong>Total Tasks:</strong>{" "}
            {tasks.length}
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <p style={{ color: "green" }}>
            {message}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {/* Tasks Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <h2>Tasks</h2>

          <button onClick={openCreateTask}>
            + Add Task
          </button>
        </div>

        {/* Search + Filters */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              padding: "10px",
              minWidth: "220px",
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            style={{ padding: "10px" }}
          >
            <option value="">
              All Status
            </option>

            <option value="TODO">
              TODO
            </option>

            <option value="IN_PROGRESS">
              IN PROGRESS
            </option>

            <option value="COMPLETED">
              COMPLETED
            </option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value)
            }
            style={{ padding: "10px" }}
          >
            <option value="">
              All Priority
            </option>

            <option value="LOW">
              LOW
            </option>

            <option value="MEDIUM">
              MEDIUM
            </option>

            <option value="HIGH">
              HIGH
            </option>
          </select>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (

          <div
            style={{
              padding: "30px",
              border: "1px solid #444",
              borderRadius: "10px",
            }}
          >
            <p>
              {tasks.length === 0
                ? "No tasks available for this project."
                : "No tasks match your filters."}
            </p>

            {tasks.length === 0 && (
              <button
                type="button"
                className="add-task-button"
                onClick={openCreateTask}
              >
                + Add Task
              </button>
            )}
          </div>

        ) : (

          <div>

            {filteredTasks.map((task) => (

              <div
                key={task.id}
                style={{
                  border: "1px solid #444",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "15px",
                }}
              >

                <h3>{task.title}</h3>

                <p>
                  {task.description ||
                    "No description"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {task.status}
                </p>

                <p>
                  <strong>Priority:</strong>{" "}
                  {task.priority}
                </p>

                <p>
                  <strong>Due Date:</strong>{" "}
                  {task.due_date
                    ? new Date(
                        task.due_date
                      ).toLocaleDateString()
                    : "Not set"}
                </p>

                <p>
                  <strong>Assigned To:</strong>{" "}
                  {task.assigned_user ||
                    "Admin"}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >

                  <button onClick={() => setEditingTask(task)}>
  Edit
</button>

                  <button
    type="button"
    onClick={() => handleDelete(task.id)}
  >
    Delete
  </button>

                </div>

              </div>

            ))}

          </div>

        )}
        {editingTask && (
  <EditTask
    task={editingTask}
    onClose={() => setEditingTask(null)}
    onTaskUpdated={(updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id
            ? { ...task, ...updatedTask }
            : task
        )
      );
    }}
  />
)}

        {/* Add / Edit Task Form */}
        {showForm && (

          <div
            style={{
              marginTop: "30px",
              padding: "25px",
              border: "1px solid #555",
              borderRadius: "10px",
              maxWidth: "600px",
            }}
          >

            <h2>
              {editingTask
                ? "Edit Task"
                : "Add Task"}
            </h2>

            <form onSubmit={handleSubmit}>

              {/* Title */}
              <div
                style={{
                  marginBottom: "15px",
                }}
              >
                <label>
                  Task Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                  }}
                />
              </div>

              {/* Description */}
              <div
                style={{
                  marginBottom: "15px",
                }}
              >
                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                  }}
                />
              </div>

              {/* Priority */}
              <div
                style={{
                  marginBottom: "15px",
                }}
              >
                <label>
                  Priority *
                </label>

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                  }}
                >
                  <option value="LOW">
                    LOW
                  </option>

                  <option value="MEDIUM">
                    MEDIUM
                  </option>

                  <option value="HIGH">
                    HIGH
                  </option>
                </select>
              </div>

              {/* Status */}
              <div
                style={{
                  marginBottom: "15px",
                }}
              >
                <label>
                  Status *
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                  }}
                >
                  <option value="TODO">
                    TODO
                  </option>

                  <option value="IN_PROGRESS">
                    IN PROGRESS
                  </option>

                  <option value="COMPLETED">
                    COMPLETED
                  </option>
                </select>
              </div>

              {/* Due Date */}
              <div
                style={{
                  marginBottom: "15px",
                }}
              >
                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                  }}
                />
              </div>

              {/* Assigned To */}
              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <label>
                  Assigned To
                </label>

                <select
                  name="assigned_to"
                  value={form.assigned_to}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                  }}
                >
                  <option value="1">
                    Admin
                  </option>
                </select>
              </div>

              {/* Submit */}
              <button type="submit">
                {editingTask
                  ? "Update Task"
                  : "Create Task"}
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={resetForm}
                style={{
                  marginLeft: "10px",
                }}
              >
                Cancel
              </button>

            </form>

          </div>

        )}

      </main>
    </div>
  );
}

export default ProjectDetails;