import React from 'react';

function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'submit',
  className = '', 
  style,
  disabled,
  ...props 
}) {

  const baseClass = [
    `${variant}-btn`,
    disabled ? 'btn-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={baseClass} 
      style={style}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;