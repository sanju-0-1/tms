import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { departmentService } from "../services/api";
import "./DepartmentPage.css";

const DepartmentPage = () => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.role === "SuperAdmin") {
      fetchDepartments();
    }
  }, [user]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAll();
      setDepartments(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // client-side validation for shortName length (2-8 chars)
    const shortLen = (formData.shortName || "").trim().length;
    if (shortLen < 2 || shortLen > 8) {
      setError("Short Name must be between 2 and 8 characters");
      return;
    }

    try {
      if (editingId) {
        await departmentService.update(editingId, formData);
      } else {
        await departmentService.create(formData);
      }
      setFormData({ name: "", shortName: "" });
      setEditingId(null);
      setShowForm(false);
      fetchDepartments();
    } catch (err) {
      setError("Failed to save department");
    }
  };

  const handleEdit = (department) => {
    setFormData(department);
    setEditingId(department._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await departmentService.delete(id);
        fetchDepartments();
      } catch (err) {
        setError("Failed to delete department");
      }
    }
  };

  if (loading)
    return (
      <div className="department-page">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="department-page">
      <div className="department-page-header">
        <h1>Department Management</h1>
        {user?.role === "SuperAdmin" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="primary-action-btn"
          >
            {showForm ? "Cancel" : "Add Department"}
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && user?.role === "SuperAdmin" && (
          <form onSubmit={handleSubmit} className="department-form-card side-form-card">
          <div className="form-group-item">
            <label>Department Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g. Computer Science"
            />
          </div>
          <div className="form-group-item">
            <label>Short Name</label>
            <input
              type="text"
              value={formData.shortName}
              onChange={(e) =>
                setFormData({ ...formData, shortName: e.target.value })
              }
              required
              minLength="2"
              maxLength="8"
              placeholder="2-8 chars (e.g. CSE)"
            />
          </div>
          <button
            type="submit"
            className="primary-action-btn"
            style={{ width: "100%" }}
          >
            {editingId ? "Update Department" : "Create Department"}
          </button>
        </form>
      )}

        <div className="department-table-card">
        <div className="table-wrapper">
          <table className="department-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Short Name</th>
                {user?.role === "SuperAdmin" && (
                  <th style={{ textAlign: "right" }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <tr key={dept._id}>
                    <td>
                      <strong>{dept.name}</strong>
                    </td>
                    <td>{dept.shortName}</td>
                    {user?.role === "SuperAdmin" && (
                      <td style={{ textAlign: "right" }}>
                        <div className="department-actions">
                          <button
                            onClick={() => handleEdit(dept)}
                            className="edit-action-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(dept._id)}
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
                    colSpan={user?.role === "SuperAdmin" ? 3 : 2}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#64748b",
                    }}
                  >
                    No departments found.
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

export default DepartmentPage;
