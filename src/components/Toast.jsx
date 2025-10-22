"use client";
import React, { useState, useEffect } from 'react';

const Toast = ({ 
  show, 
  onClose, 
  type = 'success', 
  title = '', 
  message = '', 
  duration = 5000,
  position = 'top-end'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'ph-check-circle';
      case 'error':
        return 'ph-warning-circle';
      case 'warning':
        return 'ph-warning';
      case 'info':
        return 'ph-info';
      default:
        return 'ph-check-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
      case 'warning':
        return '#faad14';
      case 'info':
        return '#1890ff';
      default:
        return '#52c41a';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
      case 'warning':
        return '#faad14';
      case 'info':
        return '#1890ff';
      default:
        return '#52c41a';
    }
  };

  const positionClass = {
    'top-start': 'top-0 start-0',
    'top-center': 'top-0 start-50 translate-middle-x',
    'top-end': 'top-0 end-0',
    'bottom-start': 'bottom-0 start-0',
    'bottom-center': 'bottom-0 start-50 translate-middle-x',
    'bottom-end': 'bottom-0 end-0'
  };

  return (
    <div 
      className={`toast-container position-fixed ${positionClass[position] || positionClass['top-end']} p-3`}
      style={{ zIndex: 9999 }}
    >
      <div 
        className={`toast ${isVisible ? 'show' : ''}`}
        role="alert"
        style={{
          minWidth: '320px',
          maxWidth: '420px',
          backgroundColor: '#fff',
          border: `1px solid ${getBorderColor()}`,
          borderRadius: '8px',
          boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-100%) scale(0.8)',
          opacity: isVisible ? 1 : 0,
          overflow: 'hidden'
        }}
      >
        <div 
          className="d-flex align-items-start p-16"
          style={{ gap: '12px' }}
        >
          {/* Icon */}
          <div 
            className="flex-shrink-0 d-flex align-items-center justify-content-center"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: `${getIconColor()}15`,
              marginTop: '2px'
            }}
          >
            <i 
              className={`ph ${getIcon()}`}
              style={{
                fontSize: '16px',
                color: getIconColor()
              }}
            ></i>
          </div>

          {/* Content */}
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            {title && (
              <div 
                className="fw-semibold mb-4"
                style={{
                  fontSize: '14px',
                  color: '#262626',
                  lineHeight: '1.4'
                }}
              >
                {title}
              </div>
            )}
            <div 
              className="text-muted"
              style={{
                fontSize: '14px',
                color: '#595959',
                lineHeight: '1.4',
                wordBreak: 'break-word'
              }}
            >
              {message}
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            className="btn-close flex-shrink-0"
            onClick={handleClose}
            aria-label="Close"
            style={{
              width: '16px',
              height: '16px',
              padding: '0',
              border: 'none',
              background: 'none',
              fontSize: '12px',
              color: '#8c8c8c',
              cursor: 'pointer',
              marginTop: '2px'
            }}
          >
            <i className="ph ph-x"></i>
          </button>
        </div>

        {/* Progress Bar */}
        <div 
          className="position-absolute bottom-0 start-0 w-100"
          style={{
            height: '3px',
            backgroundColor: `${getIconColor()}20`,
            borderRadius: '0 0 8px 8px'
          }}
        >
          <div 
            className="h-100"
            style={{
              backgroundColor: getIconColor(),
              borderRadius: '0 0 8px 8px',
              animation: `toast-progress ${duration}ms linear forwards`
            }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

// Toast Hook for easy usage
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (toastData) => {
    const id = Date.now();
    const newToast = {
      id,
      ...toastData,
      show: true
    };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const hideToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </>
  );

  return {
    showToast,
    hideToast,
    ToastContainer
  };
};

export default Toast;
