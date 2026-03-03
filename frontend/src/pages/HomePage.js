import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./HomePage.css";

const HomePage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);

  const adminLinks = [
    { to: "/departments", label: "Departments", icon: "🏢" },
    { to: "/programmes", label: "Programmes", icon: "📚" },
    { to: "/blocks", label: "Blocks", icon: "🏗️" },
    { to: "/rooms", label: "Rooms", icon: "🚪" },
    { to: "/roles", label: "Roles", icon: "🛡️" },
    { to: "/users", label: "Users", icon: "👥" },
  ];

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="brand-badge">TMS</div>
          <h1 className="home-title">
            {isAuthenticated && user?.role === "SuperAdmin" ? (
              <>
                Super Admin <span>Dashboard</span>
              </>
            ) : (
              <>
                Complaint <span>Management</span> System
              </>
            )}
          </h1>
          <p className="home-subtitle">
            Efficiently track, manage, and resolve facility issues with our
            streamlined platform.
          </p>
        </div>

        {/* Dynamic Content Section */}
        <div className="content-section">
          {isAuthenticated ? (
            <div className="user-welcome-card">
              <div className="user-info">
                <div className="avatar-placeholder">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="user-details">
                  <h2>Welcome back, {user?.username}!</h2>
                  <div className="role-tag">
                    <span className="role-dot"></span>
                    {user?.role} Access
                  </div>
                </div>
              </div>

              {user?.role === "SuperAdmin" && (
                <div className="dashboard-grid">
                  <div className="section-header">
                    <h3 className="section-label">⚡ Admin Quick Actions</h3>
                  </div>
                  <div className="quick-links-container">
                    {adminLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="quick-link-card"
                      >
                        <div className="link-icon">{link.icon}</div>
                        <span className="link-label">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback for non-admin users if needed, or simply empty */}
              {user?.role !== "SuperAdmin" && (
                <div
                  className="login-message"
                  style={{ background: "#f8fafc", border: "none" }}
                >
                  <p>
                    Navigate using the menu above to manage your complaints.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="login-message">
              <p>Please log in to access your dashboard.</p>
              <Link to="/login" className="login-btn">
                Login Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
