"use client";

import { useEffect, useState } from "react";

type DashboardData = {
  project: {
    id: number;
    name: string;
  };
  statistics: {
    totalTasks: number;
    todoTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    onHoldTasks: number;
    totalMembers: number;
  };
};

export default function ProjectDashboard({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/project-dashboard/${params.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [params.id]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>Loading Dashboard...</h1>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-page">
        <h1>Dashboard</h1>
        <p>Unable to load project dashboard.</p>
      </div>
    );
  }

  const { project, statistics } = data;

  const completionPercentage =
    statistics.totalTasks === 0
      ? 0
      : Math.round(
          (statistics.completedTasks / statistics.totalTasks) * 100
        );

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-label">PROJECT DASHBOARD</p>

          <h1>{project.name}</h1>

          <p>Project overview and task progress</p>
        </div>

        <button
          className="back-project-button"
          onClick={() => {
            window.location.href = "/projects";
          }}
        >
          ← Back to Projects
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span>Total Tasks</span>
          <strong>{statistics.totalTasks}</strong>
        </div>

        <div className="dashboard-stat-card">
          <span>To Do</span>
          <strong>{statistics.todoTasks}</strong>
        </div>

        <div className="dashboard-stat-card">
          <span>In Progress</span>
          <strong>{statistics.inProgressTasks}</strong>
        </div>

        <div className="dashboard-stat-card">
          <span>Completed</span>
          <strong>{statistics.completedTasks}</strong>
        </div>

        <div className="dashboard-stat-card">
          <span>On Hold</span>
          <strong>{statistics.onHoldTasks}</strong>
        </div>

        <div className="dashboard-stat-card">
          <span>Members</span>
          <strong>{statistics.totalMembers}</strong>
        </div>
      </div>

      <div className="dashboard-progress-card">
        <h2>Task Progress</h2>

        {statistics.totalTasks === 0 ? (
          <p>No tasks have been created for this project yet.</p>
        ) : (
          <>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{
                  width: `${completionPercentage}%`,
                }}
              ></div>
            </div>

            <p className="progress-text">
              {completionPercentage}% completed
            </p>
          </>
        )}
      </div>
    </div>
  );
}