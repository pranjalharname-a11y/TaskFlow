import { useEffect, useState } from "react";
import api from "../services/api";

function EditTask({ task, onClose, onTaskUpdated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    due_date: "",
    assigned_to: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "TODO",
      priority: task.priority || "MEDIUM",
      due_date: task.due_date
        ? task.due_date.substring(0, 10)
        : "",
      assigned_to: task.assigned_to || 1,
    });
  }, [task]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.put(`/tasks/${task.id}`, {
        ...formData,
        assigned_to: Number(formData.assigned_to),
      });

      onTaskUpdated(response.data.data);
      onClose();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update task"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Edit Task</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Task title"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>

        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <input
          type="date"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
        />

        <input
          type="number"
          name="assigned_to"
          value={formData.assigned_to}
          onChange={handleChange}
          min="1"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditTask;