import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { complaintService } from "../services/api";
import {
  Briefcase,
  Clock,
  CheckCircle,
  Zap,
  ArrowRight,
  Plus,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import "./DashboardPage.css";

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    inProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAll();
      const all = res.data || [];
      
      let filtered = all;
      const userId = user?.id || user?._id;

      if (user?.role === "User") {
        // Users see complaints they created
        filtered = all.filter((c) => {
          const createdById = c.createdBy?._id || c.createdBy;
          return String(createdById) === String(userId);
        });
      } else if (user?.role !== "SuperAdmin") {
        // Staff/Technicians see complaints assigned to them
        filtered = all.filter((c) => {
          const assignedToId = c.assignedTo?._id || c.assignedTo;
          return String(assignedToId) === String(userId);
        });
      }
      // SuperAdmin sees all (handled by filtered = all)

      setComplaints(filtered);

      const s = {
        total: filtered.length,
        pending: filtered.filter((c) => c.status === "Pending").length,
        completed: filtered.filter((c) => ["Completed", "Resolved"].includes(c.status)).length,
        inProgress: filtered.filter((c) => ["In-Progress", "Assigned"].includes(c.status)).length,
      };
      setStats(s);
      setError("");
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isStaff = user?.role !== "User" && user?.role !== "SuperAdmin";
  const isSuperAdmin = user?.role === "SuperAdmin";

  return (
    <div className="dashboard-content">
      <div className="dashboard-container">
        {/* Header Section */}
        <header className="page-header">
          <div className="welcome-section">
            <span className="welcome-badge">
              {isSuperAdmin ? "System Control" : isStaff ? "Field Operations" : "Member Hub"}
            </span>
            <h1>
              Welcome, <span className="highlight">{user?.username}</span>! ✨
            </h1>
            <p className="subtitle">
              {isSuperAdmin 
                ? "Global system overview and complaint trends." 
                : isStaff 
                  ? "Manage your assigned technical tasks and resolutions." 
                  : "Track your reported issues and facility feedback."}
            </p>
          </div>
          
          {!isSuperAdmin && !isStaff && (
            <Link to="/complaints/new" className="action-button-glow">
              <Plus size={20} />
              <span>Raise New Complaint</span>
            </Link>
          )}
        </header>

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <section className="dashboard-stats">
          <div className="stat-card glass-card luxury-blue">
            <div className="stat-body">
              <p className="stat-label">{isSuperAdmin ? "Global Tickets" : isStaff ? "Assigned Tasks" : "Total Raised"}</p>
              <h2 className="stat-value">{stats.total}</h2>
            </div>
            <div className="stat-visual">
              <Briefcase size={28} />
            </div>
          </div>

          <div className="stat-card glass-card luxury-gold">
            <div className="stat-body">
              <p className="stat-label">Pending Review</p>
              <h2 className="stat-value">{stats.pending}</h2>
            </div>
            <div className="stat-visual">
              <Clock size={28} />
            </div>
          </div>

          <div className="stat-card glass-card luxury-emerald">
            <div className="stat-body">
              <p className="stat-label">Resolved Units</p>
              <h2 className="stat-value">{stats.completed}</h2>
            </div>
            <div className="stat-visual">
              <CheckCircle size={28} />
            </div>
          </div>

          <div className="stat-card glass-card luxury-teal">
            <div className="stat-body">
              <p className="stat-label">Active Progress</p>
              <h2 className="stat-value">{stats.inProgress}</h2>
            </div>
            <div className="stat-visual">
              <Zap size={28} />
            </div>
          </div>
        </section>

        <div className="dashboard-main-grid">
          {/* Recent Activity Section */}
          <section className="activity-section glass-card">
            <div className="section-head">
              <div className="head-text">
                <h3>{isSuperAdmin ? "System-wide Activity" : isStaff ? "Your Queue" : "My Recent Issues"}</h3>
                <p>Latest status updates for complaints</p>
              </div>
              <Link to={isSuperAdmin ? "/complaints" : "/my-complaints"} className="text-link">
                View All <ArrowRight size={16} />
              </Link>
            </div>

            <div className="activity-list">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <span>Pulling latest feed...</span>
                </div>
              ) : complaints.length > 0 ? (
                complaints.slice(0, 5).map((c) => (
                  <div key={c._id} className="activity-item">
                    <div className="item-meta">
                      <div className={`status-pill ${c.status.toLowerCase()}`}>
                        {c.status}
                      </div>
                      <div className="item-details">
                        <h4>{c.complaintType}</h4>
                        <p>{c.blockName} • Room {c.roomNumber} • {new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link 
                      to={isSuperAdmin ? "/complaints" : "/my-complaints"} 
                      className="item-action-btn"
                    >
                      Details
                    </Link>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📂</div>
                  <p>No activity found in your record.</p>
                </div>
              )}
            </div>
          </section>

          {/* Efficiency & Insight Section */}
          <section className="insight-section">
            <div className="panel info-panel glass-card">
              <h3><TrendingUp size={20} /> System Insights</h3>
              <p>
                {isStaff 
                  ? "You are maintaining a resolution efficiency of 94%. Keep it up!" 
                  : isSuperAdmin 
                    ? "Peak volume detected in Electrical complaints this week." 
                    : "Facility managers are prioritizing Block A maintenance today."}
              </p>
              <div className="metric-row">
                <div className="metric-item">
                  <span>EFFICIENCY</span>
                  <h4>94%</h4>
                </div>
                <div className="metric-item">
                  <span>AVG. TIME</span>
                  <h4>2.4h</h4>
                </div>
              </div>
            </div>

            <div className="panel action-panel glass-card">
              <h3>Quick Support</h3>
              <p>Need help navigating the system?</p>
              <button className="outline-btn">Contact IT Support</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
