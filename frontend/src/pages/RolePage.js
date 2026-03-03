import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { roleService } from "../services/api";
import "./RolePage.css";

const RolePage = () => {
  const { user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    permissions: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.role === "SuperAdmin") {
      fetchRoles();
    }
  }, [user]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAll();
      setRoles(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const permissions = formData.permissions
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);

      const data = { ...formData, permissions };

      if (editingId) {
        await roleService.update(editingId, data);
      } else {
        await roleService.create(data);
      }
      setFormData({ name: "", permissions: "" });
      setEditingId(null);
      setShowForm(false);
      fetchRoles();
    } catch (err) {
      setError("Failed to save role");
    }
  };

  const handleEdit = (role) => {
    setFormData({
      name: role.name,
      permissions: role.permissions?.join(", ") || "",
    });
    setEditingId(role._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await roleService.delete(id);
        fetchRoles();
      } catch (err) {
        setError("Failed to delete role");
      }
    }
  };

  if (loading)
    return (
      <div className="role-page">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="role-page">
      <div className="role-page-header">
        <h1>Role Management</h1>
        {user?.role === "SuperAdmin" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="primary-action-btn"
          >
            {showForm ? "Cancel" : "Add Role"}
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && user?.role === "SuperAdmin" && (
          <form onSubmit={handleSubmit} className="role-form-card side-form-card">
          <div className="form-group-item">
            <label>Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g., Electrician"
            />
          </div>
          <div className="form-group-item">
            <label>Permissions (comma separated)</label>
            <textarea
              value={formData.permissions}
              onChange={(e) =>
                setFormData({ ...formData, permissions: e.target.value })
              }
              rows="3"
              placeholder="e.g., view_complaints, assign_tasks, approve_work"
            ></textarea>
          </div>
          <button
            type="submit"
            className="primary-action-btn"
            style={{ width: "100%" }}
          >
            {editingId ? "Update Role" : "Create Role"}
          </button>
        </form>
      )}

        <div className="role-table-card">
        <div className="table-wrapper">
          <table className="role-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Permissions</th>
                {user?.role === "SuperAdmin" && (
                  <th style={{ textAlign: "right" }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {roles.length > 0 ? (
                roles.map((role) => (
                  <tr key={role._id}>
                    <td>
                      <strong>{role.name}</strong>
                    </td>
                    <td style={{ whiteSpace: "normal", maxWidth: "300px" }}>
                      {role.permissions && role.permissions.length > 0
                        ? role.permissions.map((perm, idx) => (
                            <span key={idx} className="permission-tag">
                              {perm}
                            </span>
                          ))
                        : "-"}
                    </td>
                    {user?.role === "SuperAdmin" && (
                      <td style={{ textAlign: "right" }}>
                        <div className="role-actions">
                          <button
                            onClick={() => handleEdit(role)}
                            className="edit-action-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(role._id)}
                            className="delete-action-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={user?.role === "SuperAdmin" ? 4 : 3}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#64748b",
                    }}
                  >
                    No roles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolePage;
