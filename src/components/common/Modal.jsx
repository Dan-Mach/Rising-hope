import React from 'react';
import './Modal.css'; 

function Modal({ children, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">&times;</button>
        {children}
      </div>
    </div>
  );
}

export default Modal;