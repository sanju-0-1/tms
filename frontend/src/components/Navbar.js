import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  PlusCircle,
  Layout,
  Building2,
  BookOpen,
  Layers,
  DoorOpen,
  ShieldCheck,
  Users,
  FileStack,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings2,
} from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [manageOpen, setManageOpen]   = useState(false);
  const manageRef = useRef(null);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setManageOpen(false);
  }, [location.pathname]);

  // Close manage dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (manageRef.current && !manageRef.current.contains(e.target)) {
        setManageOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (["/login", "/"].includes(location.pathname)) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isSuperAdmin = user?.role === "SuperAdmin";

  // Management sub-pages grouped under dropdown
  const manageItems = [
    { to: "/departments", icon: Building2, label: "Departments" },
    { to: "/programmes",  icon: BookOpen,  label: "Programmes"  },
    { to: "/blocks",      icon: Layers,    label: "Blocks"      },
    { to: "/rooms",       icon: DoorOpen,  label: "Rooms"       },
    { to: "/roles",       icon: ShieldCheck, label: "Roles"     },
  ];

  const isManageActive = manageItems.some((m) => location.pathname === m.to);

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className={`nav-link ${location.pathname === to ? "active" : ""}`}
    >
      <Icon size={17} className="nav-icon" />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className={`modern-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">

        {/* ── Brand ── */}
        <div className="nav-brand-section">
          <Link to="/dashboard" className="brand-logo">
            <div className="logo-square"><img src="/logo.png" alt="TMS Logo" /></div>
            <span className="brand-text">TMS</span>
          </Link>
        </div>

        {/* ── Desktop Links ── */}
        {isAuthenticated && (
          <div className="nav-links-section">
            <div className="nav-menu">
              <NavItem to="/complaints/new" icon={PlusCircle} label="Raise Complaint" />

              {!isSuperAdmin && (
                <NavItem to="/my-complaints" icon={Layout} label="My Activity" />
              )}

              {isSuperAdmin && (
                <>
                  <NavItem to="/complaints" icon={FileStack}  label="Complaints"   />
                  <NavItem to="/reports"    icon={BarChart3}  label="Reports"    />
                  <NavItem to="/users"      icon={Users}      label="Users"     />

                  {/* ── Manage Dropdown ── */}
                  <div className="dropdown-wrapper" ref={manageRef}>
                    <button
                      className={`nav-link dropdown-trigger ${isManageActive ? "active" : ""}`}
                      onClick={() => setManageOpen((o) => !o)}
                    >
                      <Settings2 size={17} />
                      <span>Manage</span>
                      <ChevronDown
                        size={14}
                        className={`chevron ${manageOpen ? "open" : ""}`}
                      />
                    </button>

                    {manageOpen && (
                      <div className="dropdown-menu">
                        {manageItems.map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            className={`dropdown-item ${location.pathname === to ? "active" : ""}`}
                          >
                            <Icon size={16} />
                            <span>{label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── User Zone ── */}
        <div className="nav-user-section">
          {isAuthenticated ? (
            <div className="user-profile-zone">
              <Link to="/profile" className="profile-trigger">
                <div className="avatar-wrapper">
                  {user?.username?.charAt(0).toUpperCase()}
                  <div className="status-indicator"></div>
                </div>
                <div className="user-meta">
                  <span className="username">{user?.username}</span>
                  <span className="role-badge">{user?.role}</span>
                </div>
              </Link>

              <button onClick={handleLogout} className="icon-logout-btn" title="Logout">
                <LogOut size={17} />
              </button>

              {/* Mobile hamburger */}
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-cta">Login</Link>
          )}
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {isAuthenticated && mobileOpen && (
        <div className="mobile-nav-menu">
          <NavItem to="/complaints/new" icon={PlusCircle} label="Raise Ticket" />
          {!isSuperAdmin && (
            <NavItem to="/my-complaints" icon={Layout} label="My Activity" />
          )}
          {isSuperAdmin && (
            <>
              <NavItem to="/complaints" icon={FileStack}  label="Tickets"   />
              <NavItem to="/reports"    icon={BarChart3}  label="Analytics" />
              <NavItem to="/users"      icon={Users}      label="Users"     />
              <div className="mobile-section-label">Management</div>
              {manageItems.map(({ to, icon, label }) => (
                <NavItem key={to} to={to} icon={icon} label={label} />
              ))}
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;