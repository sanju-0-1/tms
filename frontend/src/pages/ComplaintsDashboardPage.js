import React, { useEffect, useState, useContext } from "react";
import { complaintService, userService } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./ComplaintsDashboardPage.css";

const ComplaintsDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    closed: 0,
  });
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignTarget, setAssignTarget] = useState({
    complaintId: null,
    assignee: "",
  });
  const [statusTarget, setStatusTarget] = useState({
    complaintId: null,
    status: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setListLoading(true);
        const res = await complaintService.getAll();
        setComplaints(res.data || []);
        // fetch stats too
        try {
          const s = await complaintService.getStats();
          setStats(s.data || { total: 0, pending: 0, assigned: 0, closed: 0 });
        } catch (e) {}
      } catch (err) {
        setError("Failed to load complaints");
      } finally {
        setListLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (user?.role === "SuperAdmin") {
      userService
        .getAll()
        .then((res) => setUsers(res.data || []))
        .catch(() => {});
    }
  }, [user]);

  const refresh = async () => {
    try {
      const res = await complaintService.getAll();
      setComplaints(res.data || []);
      try {
        const s = await complaintService.getStats();
        setStats(s.data || { total: 0, pending: 0, assigned: 0, closed: 0 });
      } catch (e) {}
    } catch (e) {}
  };

  const handleAssignClick = (id) =>
    setAssignTarget({ complaintId: id, assignee: "" });
  const handleAssignSubmit = async () => {
    if (!assignTarget.assignee) return setError("Select an assignee");
    try {
      await complaintService.assign(
        assignTarget.complaintId,
        assignTarget.assignee,
      );
      setAssignTarget({ complaintId: null, assignee: "" });
      refresh();
    } catch (err) {
      setError("Failed to assign");
    }
  };

  const handleStatusClick = (id) =>
    setStatusTarget({ complaintId: id, status: "" });
  const handleStatusSubmit = async () => {
    if (!statusTarget.status) return setError("Select a status");
    try {
      await complaintService.updateStatus(
        statusTarget.complaintId,
        statusTarget.status,
      );
      setStatusTarget({ complaintId: null, status: "" });
      refresh();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const handleClose = async (id) => {
    try {
      await complaintService.updateStatus(id, "Completed");
      refresh();
    } catch (err) {
      setError("Failed to close");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-badge pending";
      case "In-Progress":
        return "status-badge in-progress";
      case "Completed":
        return "status-badge closed";
      case "Onhold":
        return "status-badge onhold";
      default:
        return "status-badge";
    }
  };

  return (
    <div className="complaints-dashboard">
      <div className="dashboard-header">
        <h1>Complaints Dashboard</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card assigned">
          <div className="stat-value">{stats.assigned}</div>
          <div className="stat-label">Assigned</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-value">{stats.closed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="dashboard-table-card">
        {listLoading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
        ) : (
          <div className="table-wrapper">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Block / Room</th>
                  <th>Type</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th>Raised By</th>
                  <th>Attachment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length > 0 ? (
                  complaints.map((c) => {
                    const isAssignee =
                      c.assignedTo &&
                      String(c.assignedTo._id || c.assignedTo) ===
                        String(user?.id || user?._id);
                    return (
                      <tr key={c._id}>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <strong>{c.blockName}</strong>
                          <br />
                          <span
                            style={{ fontSize: "0.85em", color: "#64748b" }}
                          >
                            {c.roomNumber}
                          </span>
                        </td>
                        <td>{c.complaintType}</td>
                        <td style={{ maxWidth: "200px", whiteSpace: "normal" }}>
                          {c.remarks || "-"}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(c.status)}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          {c.createdBy?.username || c.createdBy?.email || "-"}
                        </td>
                        <td>
                          {c.attachment ? (
                            <a
                              href={`http://localhost:5000${c.attachment}`}
                              target="_blank"
                              rel="noreferrer"
                              className="attachment-link"
                            >
                              View File
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {(isAssignee || user?.role === "SuperAdmin") &&
                              c.status !== "Completed" && (
                                <button
                                  onClick={() => handleClose(c._id)}
                                  className="action-btn"
                                  style={{
                                    borderColor: "#10b981",
                                    color: "#10b981",
                                    backgroundColor: "#ecfdf5",
                                  }}
                                >
                                  Mark Done
                                </button>
                              )}

                            {user?.role === "SuperAdmin" &&
                              (assignTarget.complaintId === c._id ? (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 5,
                                    alignItems: "center",
                                  }}
                                >
                                  <select
                                    value={assignTarget.assignee}
                                    onChange={(e) =>
                                      setAssignTarget({
                                        ...assignTarget,
                                        assignee: e.target.value,
                                      })
                                    }
                                    className="assign-dropdown"
                                  >
                                    <option value="">Select User</option>
                                    {users
                                      .filter((u) => u.role !== "SuperAdmin")
                                      .map((u) => (
                                        <option key={u._id} value={u._id}>
                                          {u.username}
                                        </option>
                                      ))}
                                  </select>
                                  <button
                                    onClick={handleAssignSubmit}
                                    className="action-btn"
                                  >
                                    Use
                                  </button>
                                  <button
                                    onClick={() =>
                                      setAssignTarget({
                                        complaintId: null,
                                        assignee: "",
                                      })
                                    }
                                    className="action-btn secondary"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAssignClick(c._id)}
                                  className="action-btn"
                                >
                                  Assign
                                </button>
                              ))}

                            {(isAssignee || user?.role === "SuperAdmin") &&
                              (statusTarget.complaintId === c._id ? (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 5,
                                    alignItems: "center",
                                  }}
                                >
                                  <select
                                    value={statusTarget.status}
                                    onChange={(e) =>
                                      setStatusTarget({
                                        ...statusTarget,
                                        status: e.target.value,
                                      })
                                    }
                                    className="assign-dropdown"
                                  >
                                    <option value="">Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In-Progress">
                                      In-Progress
                                    </option>
                                    <option value="Onhold">Onhold</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                  <button
                                    onClick={handleStatusSubmit}
                                    className="action-btn"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() =>
                                      setStatusTarget({
                                        complaintId: null,
                                        status: "",
                                      })
                                    }
                                    className="action-btn secondary"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleStatusClick(c._id)}
                                  className="action-btn secondary"
                                >
                                  Status
                                </button>
                              ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#64748b",
                      }}
                    >
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintsDashboardPage;
