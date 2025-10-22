"use client";
import React from 'react';

const Spin = ({ 
  size = 'default', 
  color = 'main-600', 
  text = '', 
  centered = false,
  className = '',
  style = {}
}) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    default: '',
    lg: 'spinner-border-lg'
  };

  const colorClass = `text-${color}`;
  const sizeClass = sizeClasses[size] || '';

  const spinnerElement = (
    <div 
      className={`spinner-border ${colorClass} ${sizeClass} ${className}`} 
      role="status"
      style={style}
    >
      <span className="visually-hidden">
        {text || 'Yuklanmoqda...'}
      </span>
    </div>
  );

  if (centered) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default Spin;
