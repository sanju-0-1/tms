import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { roleService } from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";
import "./RolePage.css";

const PERMISSIONS = ["view_complaints", "assign_tasks", "approve_work"];

const RolePage = () => {
  const { user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    permissions: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });

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

  const handlePermissionToggle = (perm) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      if (editingId) {
        await roleService.update(editingId, data);
      } else {
        await roleService.create(data);
      }
      setFormData({ name: "", permissions: [] });
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
      permissions: role.permissions || [],
    });
    setEditingId(role._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await roleService.delete(confirm.id);
      fetchRoles();
    } catch (err) {
      setError("Failed to delete role");
    } finally {
      setConfirm({ open: false, id: null });
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
            <label>Permissions</label>
            <div className="permissions-checkbox-group">
              {PERMISSIONS.map((perm) => (
                <label key={perm} className="permission-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm)}
                    onChange={() => handlePermissionToggle(perm)}
                    className="permission-checkbox"
                  />
                  <span className="permission-checkbox-text">{perm}</span>
                </label>
              ))}
            </div>
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
                    <td>
                      <div className="permissions-display">
                        {PERMISSIONS.map((perm) => {
                          const has = role.permissions?.includes(perm);
                          return (
                            <span
                              key={perm}
                              className={`perm-check-item ${has ? "perm-granted" : "perm-denied"}`}
                            >
                              <span className="perm-check-icon">{has ? "✓" : "✗"}</span>
                              {perm}
                            </span>
                          );
                        })}
                      </div>
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
      <ConfirmDialog
        open={confirm.open}
        title="Delete Role?"
        message="This role will be permanently deleted. This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
    </div>
  );
};

export default RolePage;
