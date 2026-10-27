"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "../../lib/api";

type Project = {
  id?: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
};

type Task = {
  id?: number;
  projectId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  startDate: string;
  dueDate: string;
};

type ProjectMember = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function Projects() {
  // =========================================
  // PROJECT STATE
  // =========================================

  const [showForm, setShowForm] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [status, setStatus] = useState("Planning");
  const [priority, setPriority] = useState("Medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  // =========================================
  // TASK STATE
  // =========================================

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStatus, setTaskStatus] = useState("To Do");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  // =========================================
  // EDIT / VIEW STATE
  // =========================================

  const [editingProjectId, setEditingProjectId] = useState<number | null>(
    null
  );

  const [selectedProject, setSelectedProject] = useState<Project | null>(
    null
  );

  const [selectedTaskProjectId, setSelectedTaskProjectId] = useState<
    number | null
  >(null);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // Board View
  const [showBoard, setShowBoard] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  // =========================================
  // PROJECT MEMBERS STATE
  // =========================================

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

  const [selectedMemberProjectId, setSelectedMemberProjectId] = useState<
    number | null
  >(null);

  const [showMembers, setShowMembers] = useState(false);

  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState("");

  const [loadingMembers, setLoadingMembers] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  // =========================================
  // LOAD PROJECTS
  // =========================================

  useEffect(() => {
    loadProjects();
    loadTeamMembers();
  }, []);

  const loadProjects = async () => {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch(
      "http://localhost:5001/projects",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load projects"
      );
    }

    if (data.projects) {
      const formattedProjects = data.projects.map(
        (project: any) => ({
          id: project.id,
          name: project.name,
          description: project.description || "",
          status: project.status,
          priority: project.priority,
          startDate: project.start_date || "",
          dueDate: project.due_date || "",
        })
      );

      setProjects(formattedProjects);
    }
  } catch (error) {
    console.error("Error loading projects:", error);
    alert("Could not load projects.");
  }
};

  // =========================================
  // LOAD TEAM MEMBERS
  // =========================================

  const loadTeamMembers = async () => {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch(
      "http://localhost:5001/team",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load team members"
      );
    }

    setTeamMembers(data.teamMembers || []);
  } catch (error) {
    console.error(
      "Error loading team members:",
      error
    );
  }
};

  // =========================================
  // LOAD TASKS
  // =========================================

  useEffect(() => {
    if (!selectedTaskProjectId) {
      return;
    }

    loadTasks(selectedTaskProjectId);
  }, [selectedTaskProjectId]);

  const loadTasks = async (projectId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5001/tasks/project/${projectId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load tasks");
      }

      if (data.tasks) {
        const formattedTasks = data.tasks.map((task: any) => ({
          id: task.id,
          projectId: task.project_id,
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          assignee: task.assignee || "",
          startDate: task.start_date || "",
          dueDate: task.due_date || "",
        }));

        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      alert("Could not load tasks.");
    }
  };

  // =========================================
  // LOAD PROJECT MEMBERS
  // =========================================

  const loadProjectMembers = async (projectId: number) => {
    try {
      setLoadingMembers(true);

      const response = await fetch(
        `http://localhost:5001/project-members/project/${projectId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load project members"
        );
      }

      setProjectMembers(data.projectMembers || []);
      setSelectedMemberProjectId(projectId);
      setShowMembers(true);
      setSelectedTeamMemberId("");
    } catch (error) {
      console.error("Error loading project members:", error);
      alert("Could not load project members.");
    } finally {
      setLoadingMembers(false);
    }
  };

  // =========================================
  // ADD MEMBER TO PROJECT
  // =========================================

  const addMemberToProject = async () => {
    if (!selectedMemberProjectId) {
      alert("Please select a project.");
      return;
    }

    if (!selectedTeamMemberId) {
      alert("Please select a team member.");
      return;
    }

    try {
      setAddingMember(true);

      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        "http://localhost:5001/project-members",
        {
          method: "POST",
          headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
},
          body: JSON.stringify({
            projectId: selectedMemberProjectId,
            teamMemberId: Number(selectedTeamMemberId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to add team member.");
        return;
      }

      setSelectedTeamMemberId("");

      await loadProjectMembers(selectedMemberProjectId);

      alert("Team member added to project successfully!");
    } catch (error) {
      console.error("Error adding project member:", error);
      alert("Could not connect to the Project Service.");
    } finally {
      setAddingMember(false);
    }
  };

  // =========================================
  // REMOVE MEMBER FROM PROJECT
  // =========================================

  const removeMemberFromProject = async (teamMemberId: number) => {
    if (!selectedMemberProjectId) {
      return;
    }

    const confirmRemove = window.confirm(
      "Are you sure you want to remove this member from the project?"
    );

    if (!confirmRemove) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/project-members/project/${selectedMemberProjectId}/member/${teamMemberId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to remove member.");
        return;
      }

      setProjectMembers((currentMembers) =>
        currentMembers.filter((member) => member.id !== teamMemberId)
      );

      alert("Team member removed from project.");
    } catch (error) {
      console.error("Error removing project member:", error);
      alert("Could not connect to the Project Service.");
    }
  };

  // =========================================
  // CREATE PROJECT
  // =========================================

  const createProject = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          status: status,
          priority: priority,
          startDate: startDate,
          dueDate: dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create project");
        return;
      }

      const createdProject = data.project;

      const newProject: Project = {
        id: createdProject.id,
        name: createdProject.name,
        description: createdProject.description || "",
        status: createdProject.status,
        priority: createdProject.priority,
        startDate: createdProject.start_date || "",
        dueDate: createdProject.due_date || "",
      };

      setProjects((previousProjects) => [
        newProject,
        ...previousProjects,
      ]);

      resetForm();

      alert("Project created successfully!");
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Could not connect to the Project Service.");
    }
  };

  // =========================================
  // CREATE TASK
  // =========================================

  const createTask = async (projectId: number) => {
    if (!taskTitle.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5001/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: projectId,
            title: taskTitle,
            description: taskDescription,
            status: taskStatus,
            priority: taskPriority,
            assignee: taskAssignee,
            startDate: taskStartDate,
            dueDate: taskDueDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create task");
        return;
      }

      const createdTask = data.task;

      const newTask: Task = {
        id: createdTask.id,
        projectId: createdTask.project_id,
        title: createdTask.title,
        description: createdTask.description || "",
        status: createdTask.status,
        priority: createdTask.priority,
        assignee: createdTask.assignee || "",
        startDate: createdTask.start_date || "",
        dueDate: createdTask.due_date || "",
      };

      setTasks((previousTasks) => [
        newTask,
        ...previousTasks,
      ]);

      resetTaskForm();

      alert("Task created successfully!");
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Could not connect to the Project Service.");
    }
  };

  // =========================================
  // UPDATE TASK
  // =========================================

  const updateTask = async (taskId: number) => {
    if (!taskTitle.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:5001/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
},
          body: JSON.stringify({
            title: taskTitle,
            description: taskDescription,
            status: taskStatus,
            priority: taskPriority,
            assignee: taskAssignee,
            startDate: taskStartDate,
            dueDate: taskDueDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update task");
        return;
      }

      const updatedTask = data.task;

      const formattedTask: Task = {
        id: updatedTask.id,
        projectId: updatedTask.project_id,
        title: updatedTask.title,
        description: updatedTask.description || "",
        status: updatedTask.status,
        priority: updatedTask.priority,
        assignee: updatedTask.assignee || "",
        startDate: updatedTask.start_date || "",
        dueDate: updatedTask.due_date || "",
      };

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === taskId ? formattedTask : task
        )
      );

      resetTaskForm();

      alert("Task updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Could not connect to the Project Service.");
    }
  };

  // =========================================
  // CHANGE TASK STATUS
  // =========================================

  const changeTaskStatus = async (
    task: Task,
    newStatus: string
  ) => {
    if (!task.id) {
      return;
    }

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
        throw new Error("Failed to change task status");
      }

      const data = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: data.task.status,
              }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to change task status");
    }
  };

  // =========================================
// DRAG AND DROP TASK STATUS
// =========================================

const handleTaskDrop = async (newStatus: string) => {
  if (!draggedTaskId) {
    return;
  }

  const draggedTask = tasks.find(
    (task) => task.id === draggedTaskId
  );

  if (!draggedTask) {
    setDraggedTaskId(null);
    return;
  }

  if (draggedTask.status === newStatus) {
    setDraggedTaskId(null);
    return;
  }

  await changeTaskStatus(draggedTask, newStatus);

  setDraggedTaskId(null);
};

  // =========================================
  // DELETE TASK
  // =========================================

  const deleteTask = async (taskId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:5001/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
  Authorization: `Bearer ${token}`,
},
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete task");
        return;
      }

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== taskId)
      );

      if (editingTaskId === taskId) {
        resetTaskForm();
      }

      alert("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Could not connect to the Project Service.");
    }
  };

  // =========================================
  // RESET TASK FORM
  // =========================================

  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus("To Do");
    setTaskPriority("Medium");
    setTaskAssignee("");
    setTaskStartDate("");
    setTaskDueDate("");
    setEditingTaskId(null);
  };

  // =========================================
  // EDIT TASK
  // =========================================

  const editTask = (task: Task) => {
    if (!task.id) {
      alert("Task ID not found");
      return;
    }

    setEditingTaskId(task.id);

    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskAssignee(task.assignee);
    setTaskStartDate(formatDateForInput(task.startDate));
    setTaskDueDate(formatDateForInput(task.dueDate));
  };

  // =========================================
  // EDIT PROJECT
  // =========================================

  const editProject = (project: Project) => {
    if (!project.id) {
      alert("Project ID not found");
      return;
    }

    setEditingProjectId(project.id);

    setProjectName(project.name);
    setProjectDescription(project.description);
    setStatus(project.status);
    setPriority(project.priority);
    setStartDate(formatDateForInput(project.startDate));
    setDueDate(formatDateForInput(project.dueDate));

    setShowForm(true);
  };

  // =========================================
  // UPDATE PROJECT
  // =========================================

  const updateProject = async () => {
    if (!editingProjectId) {
      return;
    }

    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/projects/${editingProjectId}`,
        {
          method: "PUT",
          headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
},
          body: JSON.stringify({
            name: projectName,
            description: projectDescription,
            status: status,
            priority: priority,
            startDate: startDate,
            dueDate: dueDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update project");
        return;
      }

      const updatedProject = data.project;

      const formattedProject: Project = {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description || "",
        status: updatedProject.status,
        priority: updatedProject.priority,
        startDate: updatedProject.start_date || "",
        dueDate: updatedProject.due_date || "",
      };

      setProjects((previousProjects) =>
        previousProjects.map((project) =>
          project.id === editingProjectId
            ? formattedProject
            : project
        )
      );

      if (selectedProject?.id === editingProjectId) {
        setSelectedProject(formattedProject);
      }

      resetForm();

      alert("Project updated successfully!");
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Could not connect to the Project Service.");
    }
  };

  // =========================================
  // DELETE PROJECT
  // =========================================

  const deleteProject = async (id?: number) => {
    if (!id) {
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/projects/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete project");
        return;
      }

      setProjects((previousProjects) =>
        previousProjects.filter((project) => project.id !== id)
      );

      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }

      if (selectedTaskProjectId === id) {
        setSelectedTaskProjectId(null);
        setTasks([]);
        setShowBoard(false);
        resetTaskForm();
      }

      if (selectedMemberProjectId === id) {
        setSelectedMemberProjectId(null);
        setProjectMembers([]);
        setShowMembers(false);
      }

      alert("Project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Could not connect to the Project Service.");
    }
  };

  // =========================================
  // RESET PROJECT FORM
  // =========================================

  const resetForm = () => {
    setProjectName("");
    setProjectDescription("");
    setStatus("Planning");
    setPriority("Medium");
    setStartDate("");
    setDueDate("");
    setEditingProjectId(null);
    setShowForm(false);
  };

  // =========================================
  // CLOSE MEMBERS
  // =========================================

  const closeMembers = () => {
    setShowMembers(false);
    setProjectMembers([]);
    setSelectedMemberProjectId(null);
    setSelectedTeamMemberId("");
  };

  // =========================================
  // DATE FORMAT
  // =========================================

  const formatDate = (date: string) => {
    if (!date) {
      return "";
    }

    return date.substring(0, 10);
  };

  const formatDateForInput = (date: string) => {
    if (!date) {
      return "";
    }

    return date.substring(0, 10);
  };

  // =========================================
  // CURRENT PROJECT FOR MEMBERS
  // =========================================

  const selectedMemberProject = projects.find(
    (project) => project.id === selectedMemberProjectId
  );

  // =========================================
  // AVAILABLE TEAM MEMBERS
  // =========================================

  const availableTeamMembers = teamMembers.filter(
    (teamMember) =>
      !projectMembers.some(
        (projectMember) =>
          projectMember.id === teamMember.id
      )
  );

  // =========================================
  // RETURN
  // =========================================

  return (
    <main className="main-content">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <h1>Projects</h1>

      <p className="subtitle">
        Manage and track all your projects.
      </p>

      {!showForm && (
        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Create Project
        </button>
      )}

      {/* =====================================
          CREATE / EDIT PROJECT
      ===================================== */}

      {showForm && (
        <div className="project-form">
          <h2>
            {editingProjectId
              ? "Edit Project"
              : "Create New Project"}
          </h2>

          <input
            type="text"
            placeholder="Project name"
            value={projectName}
            onChange={(e) =>
              setProjectName(e.target.value)
            }
          />

          <textarea
            placeholder="Project description"
            value={projectDescription}
            onChange={(e) =>
              setProjectDescription(e.target.value)
            }
          />

          <label>Status</label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option>Planning</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>On Hold</option>
          </select>

          <label>Priority</label>

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <label>Start Date</label>

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
          />

          <label>Due Date</label>

          <input
            type="date"
            value={dueDate}
            onChange={(e) =>
              setDueDate(e.target.value)
            }
          />

          <div className="form-actions">
            <button
              className="primary-button"
              onClick={
                editingProjectId
                  ? updateProject
                  : createProject
              }
            >
              {editingProjectId
                ? "Update Project"
                : "Create Project"}
            </button>

            <button
              className="cancel-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* =====================================
          PROJECT LIST
      ===================================== */}

      <div className="projects-list">
        {projects.map((project, index) => (
          <div
            className="stat-card"
            key={project.id || index}
          >
            <h2>{project.name}</h2>

            <p>
              {project.description ||
                "No description"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {project.status}
            </p>

            <p>
              <strong>Priority:</strong>{" "}
              {project.priority}
            </p>

            <p>
              <strong>Start:</strong>{" "}
              {project.startDate
                ? formatDate(project.startDate)
                : "Not set"}
            </p>

            <p>
              <strong>Due:</strong>{" "}
              {project.dueDate
                ? formatDate(project.dueDate)
                : "Not set"}
            </p>

            <div className="project-actions">

              <button
                className="primary-button"
                onClick={() =>
                  setSelectedProject(project)
                }
              >
                View Details
              </button>

              <button
                className="primary-button"
                onClick={() =>
                  editProject(project)
                }
              >
                Edit
              </button>

              <button
                className="primary-button"
                onClick={() => {
                  if (project.id) {
                    setSelectedTaskProjectId(
                      project.id
                    );

                    setShowBoard(false);

                    resetTaskForm();
                  }
                }}
              >
                Tasks
              </button>

              <button
                className="primary-button"
                onClick={() => {
                  if (project.id) {
                    loadProjectMembers(
                      project.id
                    );
                  }
                }}
              >
                Members
              </button>

              <button
  className="dashboard-button"
  onClick={() => {
    if (project.id) {
      window.location.href = `/projects/${project.id}/dashboard`;
    }
  }}
>
  Dashboard
</button>

              <button
                className="cancel-button"
                onClick={() =>
                  deleteProject(project.id)
                }
              >
                Delete
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* =====================================
          PROJECT DETAILS
      ===================================== */}

      {selectedProject && (
        <div className="project-form">

          <h2>Project Details</h2>

          <p>
            <strong>Name:</strong>{" "}
            {selectedProject.name}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {selectedProject.description ||
              "No description"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {selectedProject.status}
          </p>

          <p>
            <strong>Priority:</strong>{" "}
            {selectedProject.priority}
          </p>

          <p>
            <strong>Start Date:</strong>{" "}
            {selectedProject.startDate
              ? formatDate(
                  selectedProject.startDate
                )
              : "Not set"}
          </p>

          <p>
            <strong>Due Date:</strong>{" "}
            {selectedProject.dueDate
              ? formatDate(
                  selectedProject.dueDate
                )
              : "Not set"}
          </p>

          <button
            className="cancel-button"
            onClick={() =>
              setSelectedProject(null)
            }
          >
            Close
          </button>

        </div>
      )}

      {/* =====================================
          PROJECT MEMBERS
      ===================================== */}

      {showMembers && (
        <div className="project-form project-members-section">

          <div className="tasks-header">

            <div>
              <h2>Project Members</h2>

              <p className="tasks-subtitle">
                {selectedMemberProject
                  ? `Members assigned to ${selectedMemberProject.name}`
                  : "Manage project members"}
              </p>
            </div>

            <button
              className="cancel-button"
              onClick={closeMembers}
            >
              Close
            </button>

          </div>

          {/* ASSIGN MEMBER */}

          <div className="member-assignment-box">

            <h3>Assign Team Member</h3>

            <p>
              Select a team member to add to this
              project.
            </p>

            <div className="member-assignment-row">

              <select
                value={selectedTeamMemberId}
                onChange={(e) =>
                  setSelectedTeamMemberId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select team member
                </option>

                {availableTeamMembers.map(
                  (member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.name} -{" "}
                      {member.role}
                    </option>
                  )
                )}
              </select>

              <button
                className="primary-button"
                onClick={addMemberToProject}
                disabled={
                  addingMember ||
                  !selectedTeamMemberId
                }
              >
                {addingMember
                  ? "Adding..."
                  : "Add Member"}
              </button>

            </div>

            {availableTeamMembers.length ===
              0 &&
              teamMembers.length > 0 && (
                <p className="member-info-message">
                  All available team members are
                  already assigned to this project.
                </p>
              )}

            {teamMembers.length === 0 && (
              <p className="member-info-message">
                No team members are available.
                Add members from the Team page
                first.
              </p>
            )}

          </div>

          {/* CURRENT MEMBERS */}

          <div className="project-members-list">

            <div className="members-list-heading">
              <h3>Assigned Members</h3>

              <span>
                {projectMembers.length}{" "}
                {projectMembers.length === 1
                  ? "member"
                  : "members"}
              </span>
            </div>

            {loadingMembers ? (
              <div className="empty-state">
                <h3>
                  Loading members...
                </h3>

                <p>
                  Please wait while we load
                  project members.
                </p>
              </div>
            ) : projectMembers.length ===
              0 ? (
              <div className="empty-state">
                <h3>
                  No Members Assigned
                </h3>

                <p>
                  Select a team member above to
                  assign them to this project.
                </p>
              </div>
            ) : (
              <div className="project-member-cards">

                {projectMembers.map(
                  (member) => (
                    <div
                      className="project-member-card"
                      key={member.id}
                    >

                      <div className="team-avatar">
                        {member.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="project-member-info">

                        <h3>
                          {member.name}
                        </h3>

                        <p>
                          {member.email}
                        </p>

                        <span className="team-role">
                          {member.role}
                        </span>

                      </div>

                      <button
                        className="remove-member-button"
                        onClick={() =>
                          removeMemberFromProject(
                            member.id
                          )
                        }
                      >
                        Remove
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </div>
      )}

      {/* =====================================
          TASK AREA
      ===================================== */}

      {selectedTaskProjectId && (
        <div className="project-form task-area">

          {/* TASK HEADER */}

          <div className="tasks-header">

            <div>
              <h2>Project Tasks</h2>

              <p className="tasks-subtitle">
                Manage tasks for this project.
              </p>
            </div>

            <div className="tasks-header-actions">

              <button
                className="primary-button board-toggle-button"
                onClick={() =>
                  setShowBoard(!showBoard)
                }
              >
                {showBoard
                  ? "Hide Board"
                  : "Board View"}
              </button>

              <button
                className="cancel-button close-tasks-button"
                onClick={() => {
                  setSelectedTaskProjectId(
                    null
                  );

                  setTasks([]);

                  setShowBoard(false);

                  resetTaskForm();
                }}
              >
                Close Tasks
              </button>

            </div>
          </div>

          {/* CREATE TASK */}

          {!showBoard && (
            <div className="create-task-section">

              <h3 className="task-section-title">
                {editingTaskId
                  ? "Edit Task"
                  : "Create New Task"}
              </h3>

              <input
                type="text"
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) =>
                  setTaskTitle(e.target.value)
                }
              />

              <textarea
                placeholder="Task description"
                value={taskDescription}
                onChange={(e) =>
                  setTaskDescription(
                    e.target.value
                  )
                }
              />

              <label>Status</label>

              <select
                value={taskStatus}
                onChange={(e) =>
                  setTaskStatus(e.target.value)
                }
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>

              <label>Priority</label>

              <select
                value={taskPriority}
                onChange={(e) =>
                  setTaskPriority(
                    e.target.value
                  )
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

              <input
                type="text"
                placeholder="Assignee"
                value={taskAssignee}
                onChange={(e) =>
                  setTaskAssignee(
                    e.target.value
                  )
                }
              />

              <label>Start Date</label>

              <input
                type="date"
                value={taskStartDate}
                onChange={(e) =>
                  setTaskStartDate(
                    e.target.value
                  )
                }
              />

              <label>Due Date</label>

              <input
                type="date"
                value={taskDueDate}
                onChange={(e) =>
                  setTaskDueDate(
                    e.target.value
                  )
                }
              />

              <div className="form-actions">

                <button
                  className="primary-button"
                  onClick={() => {
                    if (editingTaskId) {
                      updateTask(
                        editingTaskId
                      );
                    } else if (
                      selectedTaskProjectId
                    ) {
                      createTask(
                        selectedTaskProjectId
                      );
                    }
                  }}
                >
                  {editingTaskId
                    ? "Update Task"
                    : "Create Task"}
                </button>

                {editingTaskId && (
                  <button
                    className="cancel-button"
                    onClick={
                      resetTaskForm
                    }
                  >
                    Cancel Edit
                  </button>
                )}

              </div>

            </div>
          )}

          {/* =================================
              BOARD VIEW
          ================================= */}

          {showBoard && (
            <div className="board-section">

              <div className="board-section-header">

                <div>
                  <h3>Project Board</h3>

                  <p>
                    Manage tasks by their current
                    status.
                  </p>
                </div>

              </div>

              <div className="kanban-board">

                {[
                  "To Do",
                  "In Progress",
                  "Completed",
                  "On Hold",
                ].map((boardStatus) => {

                  const columnTasks =
                    tasks.filter(
                      (task) =>
                        task.projectId ===
                          selectedTaskProjectId &&
                        task.status ===
                          boardStatus
                    );

                  return (
                    <div
  className="kanban-column"
  key={boardStatus}
  onDragOver={(e) => {
    e.preventDefault();
  }}
  onDrop={() => {
    handleTaskDrop(boardStatus);
  }}
>
                      <div className="kanban-column-header">

                        <h3>
                          {boardStatus}
                        </h3>

                        <span>
                          {columnTasks.length}
                        </span>

                      </div>

                      <div className="kanban-tasks">

                        {columnTasks.map(
                          (task) => (
                            <div
  className="kanban-task"
  key={task.id}
  draggable
  onDragStart={() => {
    if (task.id) {
      setDraggedTaskId(task.id);
    }
  }}
  onDragEnd={() => {
    setDraggedTaskId(null);
  }}
>
                              <select
                                value={
                                  task.status
                                }
                                onChange={(e) =>
                                  changeTaskStatus(
                                    task,
                                    e.target
                                      .value
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

                              <div className="kanban-task-top">

                                <h4>
                                  {task.title}
                                </h4>

                                <span className="task-priority">
                                  {task.priority}
                                </span>

                              </div>

                              <p className="kanban-description">
                                {task.description ||
                                  "No description"}
                              </p>

                              <div className="kanban-task-footer">

                                <span>
                                  {task.assignee ||
                                    "Unassigned"}
                                </span>

                                <span>
                                  {task.dueDate
                                    ? formatDate(
                                        task.dueDate
                                      )
                                    : "No due date"}
                                </span>

                              </div>

                            </div>
                          )
                        )}

                        {columnTasks.length ===
                          0 && (
                          <p className="empty-column">
                            No tasks
                          </p>
                        )}

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>
          )}

          {/* =================================
              NORMAL TASK LIST
          ================================= */}

          {!showBoard && (
            <div className="task-list-section">

              <div className="section-spacing"></div>

              <h3 className="task-section-title">
                Tasks
              </h3>

              {tasks
                .filter(
                  (task) =>
                    task.projectId ===
                    selectedTaskProjectId
                )
                .map((task) => (

                  <div
                    className="task-card"
                    key={task.id}
                  >

                    <div className="task-card-header">

                      <h3>
                        {task.title}
                      </h3>

                      <span className="task-priority">
                        {task.priority}
                      </span>

                    </div>

                    <p className="task-description">
                      {task.description ||
                        "No description"}
                    </p>

                    <div className="task-info">

                      <span>
                        <strong>
                          Status:
                        </strong>{" "}
                        {task.status}
                      </span>

                      <span>
                        <strong>
                          Assignee:
                        </strong>{" "}
                        {task.assignee ||
                          "Not assigned"}
                      </span>

                    </div>

                    <div className="task-dates">

                      <span>
                        <strong>
                          Start:
                        </strong>{" "}
                        {task.startDate
                          ? formatDate(
                              task.startDate
                            )
                          : "Not set"}
                      </span>

                      <span>
                        <strong>
                          Due:
                        </strong>{" "}
                        {task.dueDate
                          ? formatDate(
                              task.dueDate
                            )
                          : "Not set"}
                      </span>

                    </div>

                    <div className="task-actions">

                      <button
                        className="primary-button"
                        onClick={() =>
                          editTask(task)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="cancel-button"
                        onClick={() => {
                          if (task.id) {
                            deleteTask(
                              task.id
                            );
                          }
                        }}
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                ))}

              {tasks.filter(
                (task) =>
                  task.projectId ===
                  selectedTaskProjectId
              ).length === 0 && (
                <p>
                  No tasks yet. Create your first
                  task.
                </p>
              )}

            </div>
          )}

        </div>
      )}

    </main>
  );
}