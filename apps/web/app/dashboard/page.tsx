"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
const router = useRouter();

  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    router.push("/login");
    return;
  }

  loadDashboardData();
}, []);

 const loadDashboardData = async () => {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const projectResponse = await fetch(
      "http://localhost:5001/projects",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

      const projectData = await projectResponse.json();

      if (!projectData.projects) {
        return;
      }

      setProjectCount(projectData.projects.length);

      let totalTasks = 0;

      for (const project of projectData.projects) {
        if (!project.id) {
          continue;
        }

        try {
          const taskResponse = await fetch(
            `http://localhost:5001/tasks/project/${project.id}`
          );

          const taskData = await taskResponse.json();

          if (taskData.tasks) {
            totalTasks += taskData.tasks.length;
          }
        } catch (error) {
          console.error(
            `Error loading tasks for project ${project.id}:`,
            error
          );
        }
      }

      setTaskCount(totalTasks);
    } catch (error) {
      console.error(
        "Error loading dashboard data:",
        error
      );
    }
  };

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">
          ProjectHub
        </div>

        <nav>
          <a href="/dashboard">📊 Dashboard</a>
          <a href="/projects">📁 Projects</a>
          <a href="/tasks">✅ Tasks</a>
          <a href="/dashboard">👥 Team</a>
          <a href="/dashboard">⚙️ Settings</a>
        </nav>

       <div
  className="logout"
  onClick={() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  }}
>
  🚪 Logout
</div>

      </aside>

      {/* Main Content */}
      <main className="main-content">

        <div className="dashboard-heading">

          <h1>Dashboard</h1>

          <p className="subtitle">
            Welcome to your Project Management Platform.
          </p>

        </div>

        {/* Statistics */}
        <div className="stats-container">

          <div className="stat-card">
            <h3>Projects</h3>

            <p className="stat-number">
              {projectCount}
            </p>

            <p>Total Projects</p>
          </div>

          <div className="stat-card">
            <h3>Tasks</h3>

            <p className="stat-number">
              {taskCount}
            </p>

            <p>Total Tasks</p>
          </div>

          <div className="stat-card">
            <h3>Team Members</h3>

            <p className="stat-number">
              0
            </p>

            <p>Team Members</p>
          </div>

        </div>

        {/* Quick Actions */}
        <section className="quick-actions-section">

          <div className="quick-actions-heading">

            <h2>Quick Actions</h2>

            <p>
              Quickly access your projects and tasks.
            </p>

          </div>

          <div className="quick-actions-grid">

            <a
              href="/projects"
              className="quick-action-card"
            >
              <div className="quick-action-icon">
                📁
              </div>

              <div>
                <h3>Projects</h3>

                <p>
                  Create and manage your projects
                </p>
              </div>

              <span className="quick-action-arrow">
                →
              </span>
            </a>

            <a
              href="/tasks"
              className="quick-action-card"
            >
              <div className="quick-action-icon">
                ✅
              </div>

              <div>
                <h3>Tasks</h3>

                <p>
                  View and manage all your tasks
                </p>
              </div>

              <span className="quick-action-arrow">
                →
              </span>
            </a>

          </div>

        </section>

      </main>

    </div>
  );
}