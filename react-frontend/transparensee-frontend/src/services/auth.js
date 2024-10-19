import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const register = async (email, username, firstName, lastName, password, confirmPassword) => {
  try {
    const response = await axios.post(API_URL + 'register/', {
      email,
      username,
      first_name: firstName,
      last_name: lastName,
      password,
      confirm_password: confirmPassword,
    });

    if (response.data.token) {
      setAuthToken(response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error('Registration API error:', error.response?.data || error); //  for debugging
    throw error.response?.data || error; // Return the error response data if available
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(API_URL + 'token/', {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  try {
    setAuthToken(token);
    const response = await axios.get(API_URL + 'user/');
    return response.data;
  } catch (error) {
    logout();
    throw error.response.data;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await axios.post(API_URL + 'token/refresh/', {
      refresh: refreshToken,
    });
    if (response.data.access) {
      setAuthToken(response.data.access);
    }
    return response.data;
  } catch (error) {
    logout();
    throw error.response.data;
  }
};

// Interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);