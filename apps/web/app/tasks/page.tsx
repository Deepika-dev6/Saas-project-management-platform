"use client";

import { useEffect, useState } from "react";

type Project = {
  id: number;
  name: string;
};

type Task = {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  startDate: string;
  dueDate: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);

      const projectResponse = await fetch(
        "http://localhost:5001/projects"
      );

      const projectData = await projectResponse.json();

      if (!projectData.projects) {
        setTasks([]);
        return;
      }

      const allProjects: Project[] = projectData.projects;

      const taskRequests = allProjects.map(async (project) => {
        try {
          const response = await fetch(
            `http://localhost:5001/tasks/project/${project.id}`
          );

          const data = await response.json();

          if (!data.tasks) {
            return [];
          }

          return data.tasks.map((task: any) => ({
            id: task.id,
            projectId: task.project_id,
            projectName: project.name,
            title: task.title,
            description: task.description || "",
            status: task.status,
            priority: task.priority,
            assignee: task.assignee || "",
            startDate: task.start_date || "",
            dueDate: task.due_date || "",
          }));
        } catch (error) {
          console.error(
            `Error loading tasks for project ${project.id}:`,
            error
          );

          return [];
        }
      });

      const taskResults = await Promise.all(taskRequests);

      const combinedTasks = taskResults.flat();

      setTasks(combinedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const changeTaskStatus = async (
    task: Task,
    newStatus: string
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5001/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            status: newStatus,
            priority: task.priority,
            assignee: task.assignee,
            startDate: task.startDate || null,
            dueDate: task.dueDate || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update task status.");
    }
  };

  const deleteTask = async (taskId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete task.");
    }
  };

  const formatDate = (date: string) => {
    if (!date) {
      return "Not set";
    }

    return date.substring(0, 10);
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

        <div className="logout">
          🚪 Logout
        </div>

      </aside>

      {/* Main Content */}
      <main className="main-content">

        <div className="page-header-row">

          <div>
            <h1>Tasks</h1>

            <p className="subtitle">
              View and manage tasks across all projects.
            </p>
          </div>

          <a
            href="/projects"
            className="secondary-action-button"
          >
            📁 Manage Projects
          </a>

        </div>

        {loading ? (
          <div className="empty-state">
            <h3>Loading tasks...</h3>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No Tasks Yet</h3>

            <p>
              Create tasks from the Projects page.
            </p>

            <a
              href="/projects"
              className="primary-button"
            >
              Go to Projects
            </a>
          </div>
        ) : (
          <div className="all-tasks-list">

            {tasks.map((task) => (
              <div
                className="all-task-card"
                key={task.id}
              >

                <div className="all-task-header">

                  <div>
                    <h2>{task.title}</h2>

                    <p className="task-project-name">
                      📁 {task.projectName}
                    </p>
                  </div>

                  <span className="task-priority">
                    {task.priority}
                  </span>

                </div>

                <p className="task-description">
                  {task.description || "No description"}
                </p>

                <div className="all-task-details">

                  <div>
                    <span>STATUS</span>

                    <select
                      value={task.status}
                      onChange={(e) =>
                        changeTaskStatus(
                          task,
                          e.target.value
                        )
                      }
                    >
                      <option value="To Do">
                        To Do
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="On Hold">
                        On Hold
                      </option>
                    </select>
                  </div>

                  <div>
                    <span>ASSIGNEE</span>

                    <strong>
                      {task.assignee || "Unassigned"}
                    </strong>
                  </div>

                  <div>
                    <span>START DATE</span>

                    <strong>
                      {formatDate(task.startDate)}
                    </strong>
                  </div>

                  <div>
                    <span>DUE DATE</span>

                    <strong>
                      {formatDate(task.dueDate)}
                    </strong>
                  </div>

                </div>

                <div className="all-task-actions">

                  <button
                    className="cancel-button"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>

    </div>
  );
}