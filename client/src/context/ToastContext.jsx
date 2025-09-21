import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, options = {}) => {
    const id = ++idCounter;
    const toast = {
      id,
      message,
      type: options.type || 'success', // success | info | error
      duration: options.duration || 2500,
    };
    setToasts((prev) => [...prev, toast]);
    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast, removeToast, toasts }), [showToast, removeToast, toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div style={containerStyle}>
      {toasts.map((t) => (
        <div key={t.id} style={{...toastStyle, ...typeStyle[t.type]}} onClick={() => removeToast(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

const containerStyle = {
  position: 'fixed',
  top: '16px',
  right: '16px',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const toastStyle = {
  minWidth: '240px',
  maxWidth: '360px',
  padding: '10px 14px',
  borderRadius: '8px',
  color: '#fff',
  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  fontSize: '14px',
  lineHeight: '1.4',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, opacity 0.2s ease',
};

const typeStyle = {
  success: { backgroundColor: '#16a34a' },
  info: { backgroundColor: '#2563eb' },
  error: { backgroundColor: '#dc2626' },
};
