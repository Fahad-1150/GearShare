export const API_BASE_URL = 'http://127.0.0.1:8000';

export const apiRequest = async (endpoint, options = {}) => {
  // Ensure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  const headers = {
    ...options.headers,
  };

  // Only add Content-Type if body is NOT FormData (browser sets it for FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Add token if it exists in localStorage
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};