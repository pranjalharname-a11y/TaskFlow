import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./Projects.css";

function Projects() {
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const [message, setMessage] = useState("");

  // -----------------------------
  // Fetch Projects
  // -----------------------------
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/projects");

      setProjects(response.data.data || []);
    } catch (error) {
      console.error(error);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // -----------------------------
  // Handle Input
  // -----------------------------
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.name.trim()) {
    setError("Project name is required");
    return;
  }

  try {
    setError("");
    setMessage("");

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setError("User information not found. Please login again.");
      return;
    }

    const user = JSON.parse(storedUser);

    if (!user?.id) {
      setError("User information is invalid. Please login again.");
      return;
    }

    const projectData = {
      name: form.name.trim(),
      description: form.description.trim(),
      created_by: user.id,
    };

    console.log("Creating project:", projectData);

    const response = await api.post("/projects", projectData);

    console.log("Create project response:", response.data);

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || "Failed to create project"
      );
    }

    // Add the newly created project to the list
    setProjects((prevProjects) => [
      response.data.data,
      ...prevProjects,
    ]);

    setMessage("Project created successfully");

    closeForm();
  } catch (error) {
    console.error("Create project error:", error);

    setError(
      error.response?.data?.message ||
        error.message ||
        "Failed to create project"
    );
  }
};
  // -----------------------------
  // Loading
  // -----------------------------
  if (loading) {
    return (
      <div className="projects-page">
        <Navbar />

        <p className="projects-message">
          Loading projects...
        </p>
      </div>
    );
  }

  // -----------------------------
  // Page
  // -----------------------------
  return (
    <div className="projects-page">
      <Navbar />

      <main className="projects-content">

        {/* Header */}
        <div className="projects-header">
          <div>
            <h1>Projects</h1>
            <p>Manage your projects and tasks</p>
          </div>

          <button
            type="button"
            className="add-project-button"
            onClick={() => setShowForm(true)}
          >
            + Add Project
          </button>
        </div>

        {/* Messages */}
        {message && (
          <p style={{ color: "green" }}>
            {message}
          </p>
        )}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {/* Create Project Form */}
        {showForm && (
          <div
            style={{
              marginBottom: "30px",
              padding: "25px",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              maxWidth: "600px",
            }}
          >
            <h2>Create Project</h2>

            <form onSubmit={handleSubmit}>

              {/* Project Name */}
              <div style={{ marginBottom: "15px" }}>
                <label>
                  Project Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: "20px" }}>
                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter project description"
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Buttons */}
              <button type="submit">
                Create Project
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  marginLeft: "10px",
                }}
              >
                Cancel
              </button>

            </form>
          </div>
        )}

        {/* Projects */}
        {projects.length === 0 ? (
          <div className="empty-projects">
            <h2>No projects yet</h2>

            <p>
              Create your first project to get started.
            </p>

            <button
              type="button"
              className="add-project-button"
              onClick={() => setShowForm(true)}
            >
              + Add Project
            </button>
          </div>
        ) : (
          <div className="project-list">

            {projects.map((project) => (
              <div
                className="project-item"
                key={project.id}
              >
                <div>
                  <h2>{project.name}</h2>

                  <p className="project-description">
                    {project.description ||
                      "No description"}
                  </p>

                  <div className="project-meta">
                    <span>
                      Tasks: {project.task_count}
                    </span>

                    <span>
                      Completed:{" "}
                      {project.completed_tasks}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/projects/${project.id}`}
                  className="view-project-button"
                >
                  View Project
                </Link>
              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  );
}

export default Projects;