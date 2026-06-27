// src/components/common/Button.jsx
import React from 'react';

function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'submit', 
  className = '', 
  style,
  ...props 
}) {
  const baseClass = `${variant}-btn ${className}`.trim();

  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={baseClass} 
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;