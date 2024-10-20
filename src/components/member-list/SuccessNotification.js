import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export const SuccessNotification = ({ message, show, duration = 3000, onClose }) => {
  // Automatically hide the toast after the specified duration
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div
      className="toast show position-fixed top-0 end-0 m-3 bg-success text-white"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="toast-header bg-success text-white">
        <strong className="me-auto">Success</strong>
        <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
      </div>
      <div className="toast-body">
        {message}
      </div>
    </div>
  );
};

