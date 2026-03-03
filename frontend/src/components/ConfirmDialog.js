import React from "react";
import "./ConfirmDialog.css";

/**
 * Reusable confirmation dialog — drop-in replacement for window.confirm().
 *
 * Usage:
 *   const [confirm, setConfirm] = useState({ open: false, id: null });
 *
 *   // Open:
 *   setConfirm({ open: true, id: item._id });
 *
 *   // In JSX:
 *   <ConfirmDialog
 *     open={confirm.open}
 *     message="This will permanently delete the item."
 *     onConfirm={() => { doDelete(confirm.id); setConfirm({ open: false, id: null }); }}
 *     onCancel={() => setConfirm({ open: false, id: null })}
 *   />
 */
const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="confirm-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">⚠️</div>
        <h2 className="confirm-title" id="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button
            className="confirm-cancel-btn"
            onClick={onCancel}
            id="confirmCancelBtn"
          >
            {cancelLabel}
          </button>
          <button
            className="confirm-delete-btn"
            onClick={onConfirm}
            id="confirmDeleteBtn"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
