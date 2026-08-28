import React from "react";

/**
 * DeleteModal.jsx
 * A plain Bootstrap-styled confirmation modal, controlled entirely
 * by React state (no bootstrap.js Modal JS API needed).
 * Shown/hidden via the `show` boolean prop.
 */
export default function DeleteModal({ show, productName, onCancel, onConfirm }) {
  if (!show) return null;

  return (
    <>
      <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button type="button" className="btn-close" onClick={onCancel}></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete <strong>{productName}</strong>?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
