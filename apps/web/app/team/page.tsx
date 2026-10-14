"use client";

import { useEffect, useState } from "react";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadTeamMembers = async () => {
    try {
      const response = await fetch("http://localhost:5001/team");

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();

      setTeamMembers(data.teamMembers || []);
    } catch (error) {
      console.error("Error loading team members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const handleAddMember = async (event: React.FormEvent) => {
    event.preventDefault();

    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("http://localhost:5001/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to add team member.");
        return;
      }

      setName("");
      setEmail("");
      setRole("Member");
      setShowForm(false);

      await loadTeamMembers();
    } catch (error) {
      console.error("Error adding team member:", error);
      setErrorMessage("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>ProjectHub</h2>

        <nav>
          <a href="/dashboard">📊 Dashboard</a>
          <a href="/projects">📁 Projects</a>
          <a href="/tasks">✅ Tasks</a>
          <a href="/team" className="active">
            👥 Team
          </a>
          <a href="/dashboard">⚙️ Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header-row">
          <div>
            <h1>Team</h1>
            <p className="page-subtitle">
              Manage and view your project team members.
            </p>
          </div>

          <button
            className="secondary-action-button"
            onClick={() => {
              setShowForm(!showForm);
              setErrorMessage("");
            }}
          >
            {showForm ? "✕ Cancel" : "+ Add Team Member"}
          </button>
        </div>

        {/* Add Team Member Form */}
        {showForm && (
          <form className="team-form" onSubmit={handleAddMember}>
            <div className="team-form-heading">
              <h2>Add Team Member</h2>
              <p>Enter the details of the new team member.</p>
            </div>

            <div className="team-form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Owner">Owner</option>
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>
            </div>

            {errorMessage && (
              <p className="team-form-error">{errorMessage}</p>
            )}

            <div className="team-form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowForm(false);
                  setErrorMessage("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-action-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Add Member"}
              </button>
            </div>
          </form>
        )}

        {/* Team Members */}
        {loading ? (
          <div className="empty-state">
            <h3>Loading team members...</h3>
            <p>Please wait while we load your team.</p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="empty-state">
            <h3>No Team Members</h3>
            <p>No team members have been added yet.</p>
          </div>
        ) : (
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div className="team-card" key={member.id}>
                <div className="team-avatar">
                  {member.name.charAt(0).toUpperCase()}
                </div>

                <div className="team-member-info">
                  <h3>{member.name}</h3>
                  <p>{member.email}</p>

                  <span className="team-role">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}