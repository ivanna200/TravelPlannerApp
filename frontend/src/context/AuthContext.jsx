import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../hooks/useAuth';
import authService from '../services/authService';

const decodeToken = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch { return null; }
};

const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token     = localStorage.getItem('token');
    const savedUser = authService.getCurrentUser();
    if (token && savedUser) {
      isTokenExpired(token) ? authService.logout() : setUser(savedUser);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;

    const validate = () => authService.validateSession().catch(() => {});

    validate();
    const interval = setInterval(validate, 5000);
    const onFocus = () => validate();

    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [user]);

  const login = useCallback(async (data) => {
    try {
      const result = await authService.login(data);
      if (result.success) setUser(result.user);
      return result;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed.' };
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const result = await authService.register(data);
      if (result.success) setUser(result.user);
      return result;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed.' };
    }
  }, []);

  const logout  = useCallback(() => { authService.logout(); setUser(null); }, []);
  const isAdmin = useCallback(() => user?.role === 'Admin', [user]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
