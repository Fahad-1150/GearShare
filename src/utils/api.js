export const API_BASE_URL = 'http://127.0.0.1:8000';

export const apiRequest = async (endpoint, options = {}) => {
  try {
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

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body && !(options.body instanceof FormData) ? JSON.parse(options.body) : 'FormData or empty'
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('API Response:', {
      url,
      status: response.status,
      ok: response.ok
    });

    return response;
  } catch (err) {
    console.error('API Fetch Error:', err);
    // Create a custom error response object
    const errorResponse = new Error(err.message || 'Network error. Please check if FastAPI server is running on http://127.0.0.1:8000');
    errorResponse.ok = false;
    errorResponse.status = 0;
    throw errorResponse;
  }
};