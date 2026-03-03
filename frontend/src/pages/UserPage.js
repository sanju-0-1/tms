import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  userService,
  departmentService,
  programmeService,
} from "../services/api";
import "./UserPage.css";

const UserPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [, setDepartments] = useState([]);
  const [, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "User",
    department: "",
    programme: "",
  });
  const [editingId, setEditingId] = useState(null);

  const roles = [
    "SuperAdmin",
    "User",
    "Networking Staff",
    "Plumber",
    "Electrician",
    "Software Developer",
    "Application",
    "PC Hardware",
  ];

  useEffect(() => {
    if (user?.role === "SuperAdmin") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, deptRes, progRes] = await Promise.all([
        userService.getAll(),
        departmentService.getAll(),
        programmeService.getAll(),
      ]);
      setUsers(userRes.data);
      setDepartments(deptRes.data);
      setProgrammes(progRes.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (!editingId) {
        if (!submitData.password) {
          setError("Password is required for new users");
          return;
        }
      } else {
        if (!submitData.password) {
          delete submitData.password;
        }
      }

      // Remove department/programme from payload when not used
      if (submitData.department === "") delete submitData.department;
      if (submitData.programme === "") delete submitData.programme;

      if (editingId) {
        await userService.update(editingId, submitData);
      } else {
        await userService.create(submitData);
      }
      setFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        role: "User",
        department: "",
        programme: "",
      });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user");
    }
  };

  const handleEdit = (userData) => {
    setFormData({
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      password: "",
      role: userData.role,
      department: userData.department?._id || userData.department || "",
      programme: userData.programme?._id || userData.programme || "",
    });
    setEditingId(userData._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await userService.delete(id);
        fetchData();
      } catch (err) {
        setError("Failed to delete user");
      }
    }
  };

  if (loading)
    return (
      <div className="user-page">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="user-page">
      <div className="user-page-header">
        <h1>User Management</h1>
        {user?.role === "SuperAdmin" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="primary-action-btn"
          >
            {showForm ? "Cancel" : "Add User"}
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && user?.role === "SuperAdmin" && (
          <form onSubmit={handleSubmit} className="user-form-card side-form-card">
          <div className="form-grid-2">
            <div className="form-group-item">
              <label>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                placeholder="e.g. jdoe"
              />
            </div>
            <div className="form-group-item">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="e.g. john@example.com"
              />
            </div>
            <div className="form-group-item">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                placeholder="e.g. 123-456-7890"
              />
            </div>
            <div className="form-group-item">
              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group-item">
              <label>
                Password{" "}
                {editingId && (
                  <span style={{ fontSize: "0.8em", fontWeight: "normal" }}>
                    (leave empty to keep current)
                  </span>
                )}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!editingId}
                  placeholder={editingId ? "******" : "New password"}
                  style={{ paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="primary-action-btn"
            style={{ width: "100%", marginTop: "1.5rem" }}
          >
            {editingId ? "Update User" : "Create User"}
          </button>
        </form>
      )}

        <div className="user-table-card">
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Department</th>
                {user?.role === "SuperAdmin" && (
                  <th style={{ textAlign: "right" }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((userData) => (
                  <tr key={userData._id}>
                    <td>
                      <strong>{userData.username}</strong>
                    </td>
                    <td>{userData.email}</td>
                    <td>{userData.phone}</td>
                    <td>
                      <span
                        className={`role-badge ${userData.role.toLowerCase().replace(" ", "-")}`}
                      >
                        {userData.role}
                      </span>
                    </td>
                    <td>{userData.department?.name || "-"}</td>
                    {user?.role === "SuperAdmin" && (
                      <td style={{ textAlign: "right" }}>
                        <div className="user-actions">
                          <button
                            onClick={() => handleEdit(userData)}
                            className="edit-action-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(userData._id)}
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
                    colSpan={user?.role === "SuperAdmin" ? 6 : 5}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#64748b",
                    }}
                  >
                    No users found.
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

export default UserPage;
