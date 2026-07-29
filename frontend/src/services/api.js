const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const getToken = () => localStorage.getItem('gastrosync_token');

const authFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${url}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('gastrosync_token');
    window.location.reload();
    throw new Error('Sesión expirada');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
};

const login = async (email, password) => {
  const data = await authFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('gastrosync_token', data.token);
  return data;
};

const register = async (userData) => {
  const data = await authFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  localStorage.setItem('gastrosync_token', data.token);
  return data;
};

const logout = () => {
  localStorage.removeItem('gastrosync_token');
};

const isAuthenticated = () => !!getToken();

export { API_URL, authFetch, login, register, logout, isAuthenticated, getToken };
