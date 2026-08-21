import "./Dashboard.css";
import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        setStats(response.data.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load dashboard");
      }
    };

    fetchDashboard();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!stats) {
    return <p>Loading dashboard...</p>;
  }

 return (
  <div className="dashboard-page">
    <Navbar />

    <main className="dashboard-content">
      <h1 className="dashboard-title">
        TaskFlow Dashboard
      </h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p className="stat-number">
            {stats.total_projects}
          </p>
        </div>

        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">
            {stats.total_tasks}
          </p>
        </div>

        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <p className="stat-number">
            {stats.pending_tasks}
          </p>
        </div>

        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <p className="stat-number">
            {stats.completed_tasks}
          </p>
        </div>
      </div>

      <h2 className="section-title">
        Recent Projects
      </h2>

            {stats.recent_projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="projects-grid">
          {stats.recent_projects.map((project) => (
            <div
              className="project-card"
              key={project.id}
            >
              <h3>{project.name}</h3>

              <p className="project-description">
                {project.description}
              </p>

              <p className="project-tasks">
                Tasks: {project.task_count} &nbsp; | &nbsp;
                Completed: {project.completed_tasks}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  </div>
  );
}

export default Dashboard;