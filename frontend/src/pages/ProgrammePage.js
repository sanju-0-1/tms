import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { programmeService, departmentService } from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";
import "./ProgrammePage.css";

const ProgrammePage = () => {
  const { user } = useContext(AuthContext);
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    department: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    if (user?.role === "SuperAdmin") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progRes, deptRes] = await Promise.all([
        programmeService.getAll(),
        departmentService.getAll(),
      ]);
      setProgrammes(progRes.data);
      setDepartments(deptRes.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch data");
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
        await programmeService.update(editingId, formData);
      } else {
        await programmeService.create(formData);
      }
      setFormData({ name: "", shortName: "", department: "" });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError("Failed to save programme");
    }
  };

  const handleEdit = (programme) => {
    setFormData(programme);
    setEditingId(programme._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await programmeService.delete(confirm.id);
      fetchData();
    } catch (err) {
      setError("Failed to delete programme");
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  if (loading)
    return (
      <div className="programme-page">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="programme-page">
      <div className="programme-page-header">
        <h1>Programme Management</h1>
        {user?.role === "SuperAdmin" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="primary-action-btn"
          >
            {showForm ? "Cancel" : "Add Programme"}
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && user?.role === "SuperAdmin" && (
          <form onSubmit={handleSubmit} className="programme-form-card side-form-card">
          <div className="form-group-item">
            <label>Programme Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g. Master of Computer Applications"
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
              placeholder="2-8 chars (e.g. MCA)"
            />
          </div>
          <div className="form-group-item">
            <label>Department</label>
            <select
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="primary-action-btn"
            style={{ width: "100%" }}
          >
            {editingId ? "Update Programme" : "Create Programme"}
          </button>
        </form>
      )}

        <div className="programme-table-card">
        <div className="table-wrapper">
          <table className="programme-table">
            <thead>
              <tr>
                <th>Programme Name</th>
                <th>Short Name</th>
                <th>Department</th>
                {user?.role === "SuperAdmin" && (
                  <th style={{ textAlign: "right" }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {programmes.length > 0 ? (
                programmes.map((prog) => (
                  <tr key={prog._id}>
                    <td>
                      <strong>{prog.name}</strong>
                    </td>
                    <td>{prog.shortName}</td>
                    <td>{prog.department?.name || "-"}</td>
                    {user?.role === "SuperAdmin" && (
                      <td style={{ textAlign: "right" }}>
                        <div className="programme-actions">
                          <button
                            onClick={() => handleEdit(prog)}
                            className="edit-action-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(prog._id)}
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
                    No programmes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmDialog
        open={confirm.open}
        title="Delete Programme?"
        message="This programme will be permanently deleted. This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
    </div>
  );
};

export default ProgrammePage;
