// src/api.js

// Generic API request
export async function apiRequest(path, options = {}) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
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

  // Automatically parse JSON if possible
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.detail || 'API request failed');
  }

  return data;
}

// === Auth endpoints using apiRequest ===

// Login
export async function login(email, password) {
  return await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Signup
export async function signup(email, password, name) {
  return await apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

// Example: Get current user
export async function getCurrentUser() {
  return await apiRequest('/auth/me', {
    method: 'GET',
  });
}
