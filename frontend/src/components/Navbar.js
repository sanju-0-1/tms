import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (location.pathname === "/login" || location.pathname === "/") {
    return null;
  }

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-brand">
          <span className="logo-icon">T</span>
          TMS
        </Link>
      </div>

      <div className="sidebar-nav">
        {isAuthenticated ? (
          <div className="nav-links">
            <Link to="/complaints/new" className={isActive("/complaints/new")}>
              <span className="nav-icon">✏️</span> Raise Complaint
            </Link>
            {user?.role !== "SuperAdmin" && (
              <Link to="/my-complaints" className={isActive("/my-complaints")}>
                <span className="nav-icon">📋</span> My Complaints
              </Link>
            )}

            {user?.role === "SuperAdmin" && (
              <>
                <Link to="/departments" className={isActive("/departments")}>
                  <span className="nav-icon">🏢</span> Departments
                </Link>
                <Link to="/programmes" className={isActive("/programmes")}>
                  <span className="nav-icon">📚</span> Programmes
                </Link>
                <Link to="/blocks" className={isActive("/blocks")}>
                  <span className="nav-icon">🏗️</span> Blocks
                </Link>
                <Link to="/rooms" className={isActive("/rooms")}>
                  <span className="nav-icon">🚪</span> Rooms
                </Link>
                <Link to="/roles" className={isActive("/roles")}>
                  <span className="nav-icon">🛡️</span> Roles
                </Link>
                <Link to="/users" className={isActive("/users")}>
                  <span className="nav-icon">👥</span> Users
                </Link>
                <Link to="/complaints" className={isActive("/complaints")}>
                  <span className="nav-icon">🗂️</span> All Complaints
                </Link>
                <Link to="/reports" className={isActive("/reports")}>
                  <span className="nav-icon">📊</span> Reports
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/login" className={isActive("/login")}>
              <span className="nav-icon">🔐</span> Login
            </Link>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        {isAuthenticated && (
          <div className="user-actions">
            <div className="user-card">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="user-info">
                <span className="user-greeting">Signed in as</span>
                <span className="user-name">{user?.username}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              🚪 <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
