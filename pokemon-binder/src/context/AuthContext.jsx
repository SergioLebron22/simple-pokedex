import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { apiUrl } from '../lib/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'pb_auth';

function loadAuth() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [auth, setAuth]               = useState(loadAuth);
  const [authModalOpen, setAuthModal] = useState(false);

  // Keep a ref so authFetch always reads the latest tokens without being recreated
  const authRef = useRef(auth);
  useEffect(() => { authRef.current = auth; }, [auth]);

  const saveAuth = useCallback((data) => {
    setAuth(data);
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(apiUrl('/api/auth/login/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Invalid credentials.');
    const meRes = await fetch(apiUrl('/api/auth/me/'), {
      headers: { Authorization: `Bearer ${data.access}` },
    });
    const user = await meRes.json();
    saveAuth({ user, access: data.access, refresh: data.refresh });
  }, [saveAuth]);

  const register = useCallback(async (username, email, password) => {
    const res = await fetch(apiUrl('/api/auth/register/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const first = Object.values(data)[0];
      throw new Error(Array.isArray(first) ? first[0] : (data.detail || 'Registration failed.'));
    }
    saveAuth({ user: data.user, access: data.access, refresh: data.refresh });
  }, [saveAuth]);

  const logout = useCallback(async () => {
    const current = authRef.current;
    if (current?.refresh) {
      try {
        await fetch(apiUrl('/api/auth/logout/'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${current.access}` },
          body: JSON.stringify({ refresh: current.refresh }),
        });
      } catch {}
    }
    saveAuth(null);
  }, [saveAuth]);

  // Fetches with auth header; auto-refreshes on 401
  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (authRef.current?.access) {
      headers.Authorization = `Bearer ${authRef.current.access}`;
    }

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401 && authRef.current?.refresh) {
      const refreshRes = await fetch(apiUrl('/api/auth/token/refresh/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: authRef.current.refresh }),
      });
      if (refreshRes.ok) {
        const tokens = await refreshRes.json();
        const newAuth = { ...authRef.current, access: tokens.access, refresh: tokens.refresh || authRef.current.refresh };
        saveAuth(newAuth);
        res = await fetch(url, { ...options, headers: { ...headers, Authorization: `Bearer ${tokens.access}` } });
      } else {
        saveAuth(null);
        throw new Error('Session expired. Please log in again.');
      }
    }

    return res;
  }, [saveAuth]);

  return (
    <AuthContext.Provider value={{
      user:           auth?.user ?? null,
      login,
      register,
      logout,
      authFetch,
      authModalOpen,
      openAuthModal:  () => setAuthModal(true),
      closeAuthModal: () => setAuthModal(false),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
