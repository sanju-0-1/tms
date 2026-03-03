import React, { useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { profileService } from "../services/api";
import "./ProfilePage.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

/* ── Password strength helper ───────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
};

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthClass = ["", "weak", "medium", "medium", "strong"];

/* ── Alert sub-component ─────────────────────────────────── */
const Alert = ({ type, children }) =>
  children ? (
    <div className={`profile-alert ${type}`}>
      {type === "success" ? "✅" : "❌"} {children}
    </div>
  ) : null;

/* ══════════════════════════════════════════════════════════ */
const ProfilePage = () => {
  const { user, refreshUser } = useContext(AuthContext);

  /* ---- Avatar / name section state ---- */
  const [username, setUsername]           = useState(user?.username || "");
  const [avatarFile, setAvatarFile]       = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg]       = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  /* ---- Password section state ---- */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading]             = useState(false);
  const [pwMsg, setPwMsg]                     = useState({ type: "", text: "" });

  /* ---- Derived ---- */
  const avatarSrc = avatarPreview
    ? avatarPreview
    : user?.profilePicture
    ? `${API_BASE}${user.profilePicture}`
    : null;

  const pwStrength = getStrength(newPassword);

  /* ── Handlers ────────────────────────────────────────── */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setProfileMsg({ type: "error", text: "Name cannot be empty." });
      return;
    }
    setProfileLoading(true);
    setProfileMsg({ type: "", text: "" });

    try {
      const fd = new FormData();
      fd.append("username", username.trim());
      if (avatarFile) fd.append("profilePicture", avatarFile);

      await profileService.updateProfile(fd);
      await refreshUser();
      setAvatarFile(null);
      setAvatarPreview(null);
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setPwLoading(true);
    setPwMsg({ type: "", text: "" });

    try {
      await profileService.changePassword(currentPassword, newPassword);
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setPwLoading(false);
    }
  };

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-page-header">
        <h1>My Profile</h1>
        <p>Manage your account details and security settings.</p>
      </div>

      <div className="profile-layout">
        {/* ── Left: Avatar Card ── */}
        <div className="profile-avatar-card">
          <div className="avatar-wrapper">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Profile" className="avatar-img" />
            ) : (
              <div className="avatar-initials">
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            <button
              type="button"
              className="avatar-upload-btn"
              title="Change photo"
              onClick={() => fileInputRef.current?.click()}
            >
              📷
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="avatar-upload-input"
              onChange={handleAvatarChange}
              id="profilePictureInput"
            />
          </div>

          <div className="avatar-user-name">{user?.username}</div>
          <div className="avatar-role-badge">{user?.role}</div>
          <div className="avatar-email">{user?.email}</div>

          {(avatarFile || username !== user?.username) && (
            <button
              className="avatar-save-btn"
              onClick={handleProfileSave}
              disabled={profileLoading}
            >
              {profileLoading ? "Saving…" : "Save Changes"}
            </button>
          )}

          {profileMsg.text && (
            <Alert type={profileMsg.type}>{profileMsg.text}</Alert>
          )}
        </div>

        {/* ── Right: Sections ── */}
        <div className="profile-right-col">

          {/* Account Info */}
          <div className="profile-section-card">
            <h2><span className="section-icon">👤</span> Account Information</h2>

            <div className="profile-info-row">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-value">{user?.email}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Role</span>
              <span className="profile-info-value">{user?.role}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Phone</span>
              <span className="profile-info-value">{user?.phone || "—"}</span>
            </div>
          </div>

          {/* Edit Name */}
          <div className="profile-section-card">
            <h2><span className="section-icon">✏️</span> Edit Name</h2>

            {profileMsg.text && !avatarFile && (
              <Alert type={profileMsg.type}>{profileMsg.text}</Alert>
            )}

            <form onSubmit={handleProfileSave}>
              <div className="profile-form-group">
                <label htmlFor="profileUsername">Display Name</label>
                <input
                  id="profileUsername"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                className="profile-submit-btn"
                disabled={profileLoading || username === user?.username}
                id="saveNameBtn"
              >
                {profileLoading ? "Saving…" : "Save Name"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="profile-section-card">
            <h2><span className="section-icon">🔐</span> Change Password</h2>

            <Alert type={pwMsg.type}>{pwMsg.text}</Alert>

            <form onSubmit={handleChangePassword}>
              <div className="profile-form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                />
                {newPassword && (
                  <>
                    <div className="password-strength">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`strength-bar ${
                            i <= pwStrength ? strengthClass[pwStrength] : ""
                          }`}
                        />
                      ))}
                    </div>
                    <div className="strength-label">
                      {strengthLabel[pwStrength]}
                    </div>
                  </>
                )}
              </div>

              <div className="profile-form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="profile-submit-btn"
                disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
                id="changePasswordBtn"
              >
                {pwLoading ? "Updating…" : "Change Password"}
              </button>
            </form>
          </div>

        </div>{/* end right col */}
      </div>{/* end layout */}
    </div>
  );
};

export default ProfilePage;
