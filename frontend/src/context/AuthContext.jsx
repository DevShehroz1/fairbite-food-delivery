import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Decode JWT payload locally — no network, instant.
// Returns { id, role } if the token is valid and not expired, otherwise null.
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null; // expired
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('quickbite_token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Decode the JWT locally first — this is instant and prevents the
    // "redirect to login during Vercel cold-start" problem.
    const decoded = decodeToken(token);
    if (!decoded) {
      // Token is malformed or expired — clear it and stop here.
      localStorage.removeItem('quickbite_token');
      setLoading(false);
      return;
    }

    // Use the decoded claims as a temporary user so RoleRoute never
    // sees isAuthenticated=false while the backend is warming up.
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(decoded);
    setLoading(false);

    // Verify with the server in the background and hydrate full user data.
    api.get('/auth/me')
      .then(res => setUser(res.data.data))
      .catch((err) => {
        // Only a real 401 means the token is invalid — log out then.
        // Network errors (cold-start timeout, offline) leave the session intact.
        if (err.response?.status === 401) {
          localStorage.removeItem('quickbite_token');
          setUser(null);
        }
      });
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('quickbite_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try { sessionStorage.setItem('qb_just_logged_in', '1'); } catch (_) {}
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('quickbite_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
      return res.data.data;
    } catch (_) { return null; }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, refreshUser, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
