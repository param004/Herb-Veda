import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hv_token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('hv_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem('hv_token', token);
    else localStorage.removeItem('hv_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('hv_user', JSON.stringify(user));
    else localStorage.removeItem('hv_user');
  }, [user]);

  const value = useMemo(() => ({ token, setToken, user, setUser }), [token, user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
