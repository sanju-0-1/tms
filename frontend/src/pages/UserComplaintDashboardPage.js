import React, { useEffect, useState, useContext, useCallback } from "react";
import { complaintService } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./UserComplaintDashboardPage.css";

const StatCard = ({ label, value, color, onClick }) => (
  <div
    className="stat-card"
    style={{ borderTop: `4px solid ${color}` }}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === "Enter" || e.key === " ") onClick();
          }
        : undefined
    }
  >
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const UserComplaintDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [myStats, setMyStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusTarget, setStatusTarget] = useState({
    complaintId: null,
    status: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAll();
      const allComplaints = res.data || [];

      // Filter complaints for current user: either created by them or assigned to them
      const userId = user?.id || user?._id;
      const userComplaints = allComplaints.filter((c) => {
        const createdById = c.createdBy?._id || c.createdBy;
        const assignedToId = c.assignedTo?._id || c.assignedTo;
        return (
          String(createdById) === String(userId) ||
          String(assignedToId) === String(userId)
        );
      });
      setComplaints(userComplaints);

      // Calculate stats
      const stats = {
        total: userComplaints.length,
        pending: userComplaints.filter((c) => c.status === "Pending").length,
        assigned: userComplaints.filter((c) => c.status === "Assigned").length,
        closed: userComplaints.filter((c) => c.status === "Completed").length,
      };
      setMyStats(stats);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredComplaints =
    filterStatus === "All"
      ? complaints
      : complaints.filter((c) => c.status === filterStatus);

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "status-badge status-pending";
      case "Assigned":
        return "status-badge status-assigned";
      case "In-Progress":
        return "status-badge status-in-progress";
      case "Onhold":
        return "status-badge status-onhold";
      case "Completed":
        return "status-badge status-closed";
      default:
        return "status-badge";
    }
  };

  if (loading)
    return (
      <div className="user-complaint-dashboard">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="user-complaint-dashboard">
      <div className="dashboard-header">
        <h1>My Complaints</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Complaint Status Dashboard */}
      <div>
        <h2
          style={{
            color: "#0f172a",
            marginBottom: "1.5rem",
            fontSize: "1.25rem",
            fontWeight: "600",
          }}
        >
          Complaint Status Overview
        </h2>
        <div className="stats-grid">
          <StatCard
            label="Total Complaints"
            value={myStats.total}
            color="#3b82f6"
            onClick={() => {
              setFilterStatus("All");
              if (complaints.length > 0) {
                viewComplaintDetails(complaints[0]);
              }
            }}
          />
          <StatCard
            label="Completed"
            value={myStats.closed}
            color="#10b981"
            onClick={() => setFilterStatus("Completed")}
          />
        </div>
      </div>

      {/* Selected Complaint Details Card */}
      {selectedComplaint && (
        <div className="complaint-details-card">
          <div className="details-header">
            <h3>Complaint Details</h3>
            <button
              onClick={() => setSelectedComplaint(null)}
              className="close-btn"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <label>Block Name</label>
              <div className="detail-value">
                {selectedComplaint.blockName || "-"}
              </div>
            </div>

            <div className="detail-item">
              <label>Room Number</label>
              <div className="detail-value">
                {selectedComplaint.roomNumber || "-"}
              </div>
            </div>

            <div className="detail-item">
              <label>Complaint Type</label>
              <div className="detail-value">
                {selectedComplaint.complaintType || "-"}
              </div>
            </div>

            <div className="detail-item">
              <label>Status</label>
              <div>
                <span
                  className={getStatusBadge(selectedComplaint.status)}
                  style={{ fontSize: "0.95rem", padding: "0.5rem 1rem" }}
                >
                  {selectedComplaint.status}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <label>Date Created</label>
              <div className="detail-value">
                {new Date(selectedComplaint.createdAt).toLocaleDateString()}{" "}
                {new Date(selectedComplaint.createdAt).toLocaleTimeString()}
              </div>
            </div>

            {selectedComplaint.assignedTo && (
              <div className="detail-item">
                <label>Assigned To</label>
                <div className="detail-value">
                  {selectedComplaint.assignedTo?.username ||
                    selectedComplaint.assignedTo ||
                    "-"}
                </div>
              </div>
            )}
          </div>

          <div className="details-grid" style={{ marginTop: "1.5rem" }}>
            {selectedComplaint.remarks && (
              <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                <label>Remarks</label>
                <div
                  className="detail-value"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {selectedComplaint.remarks}
                </div>
              </div>
            )}

            {selectedComplaint.attachment && (
              <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                <label>Attachment</label>
                <div style={{ marginTop: "0.5rem" }}>
                  <a
                    href={`http://localhost:5000/${selectedComplaint.attachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-attachment-link"
                  >
                    📎 View Attachment
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Status update section removed for complaint creators as per requirements */}
        </div>
      )}

      {/* Complaints List */}
      <div className="table-card">
        <div className="table-header">
          <h3>
            {filterStatus === "All"
              ? "All Complaints"
              : `${filterStatus} Complaints`}
          </h3>
          <button onClick={() => setFilterStatus("All")} className="btn-reset">
            Reset Filter
          </button>
        </div>

        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Block</th>
                <th>Room</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date Created</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint) => (
                  <tr
                    key={complaint._id}
                    onClick={() => viewComplaintDetails(complaint)}
                  >
                    <td>{complaint.blockName || "-"}</td>
                    <td>{complaint.roomNumber || "-"}</td>
                    <td>{complaint.complaintType || "-"}</td>
                    <td>
                      <span className={getStatusBadge(complaint.status)}>
                        {complaint.status}
                      </span>
                    </td>
                    <td>
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td>{complaint.remarks?.substring(0, 30) || "-"}...</td>
                    <td>
                      {/* Update status control for assigned staff (not SuperAdmin) */}
                      {String(
                        complaint.assignedTo?._id || complaint.assignedTo,
                      ) === String(user?._id || user?.id) &&
                      user?.role !== "SuperAdmin" ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          {statusTarget.complaintId === complaint._id ? (
                            <div
                              style={{
                                display: "flex",
                                gap: "0.5rem",
                                alignItems: "center",
                              }}
                            >
                              <select
                                className="status-select"
                                style={{ padding: "0.4rem", minWidth: "120px" }}
                                value={statusTarget.status}
                                onChange={(e) =>
                                  setStatusTarget({
                                    ...statusTarget,
                                    status: e.target.value,
                                  })
                                }
                              >
                                <option value="">Select status</option>
                                <option value="In-Progress">In-Progress</option>
                                <option value="Onhold">Onhold</option>
                                <option value="Completed">Completed</option>
                              </select>

                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    if (!statusTarget.status)
                                      return setError("Select a status");
                                    await complaintService.updateStatus(
                                      statusTarget.complaintId,
                                      statusTarget.status,
                                    );
                                    await loadData();
                                    setStatusTarget({
                                      complaintId: null,
                                      status: "",
                                    });
                                    setError("");
                                  } catch (err) {
                                    setError(
                                      err.response?.data?.message ||
                                        "Failed to update status",
                                    );
                                  }
                                }}
                                className="btn-primary"
                                style={{
                                  padding: "0.4rem 0.8rem",
                                  fontSize: "0.85rem",
                                }}
                              >
                                Save
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStatusTarget({
                                    complaintId: null,
                                    status: "",
                                  });
                                }}
                                className="btn-secondary"
                                style={{
                                  padding: "0.4rem 0.8rem",
                                  fontSize: "0.85rem",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusTarget({
                                  complaintId: complaint._id,
                                  status: "",
                                });
                              }}
                              className="btn-primary"
                              style={{
                                padding: "0.4rem 0.8rem",
                                fontSize: "0.85rem",
                              }}
                            >
                              Update Status
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#64748b",
                    }}
                  >
                    No{" "}
                    {filterStatus === "All"
                      ? "complaints"
                      : `${filterStatus.toLowerCase()} complaints`}{" "}
                    found
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

export default UserComplaintDashboardPage;
