export async function apiRequest(path, options = {}) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  return res;
}
