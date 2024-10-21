import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
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
    console.log('Registration response:', response.data);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setAuthToken(response.data.access);
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
    console.log('Login response:', response.data);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setAuthToken(response.data.access);
    }
    return response.data;
  } catch (error) {
    console.error('Login API error:', error.response?.data || error); //  for debugging
    throw error.response?.data || error; // Return the error response data if available
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  setAuthToken(null);
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return null;
  }
  try {
    setAuthToken(token);
    const response = await axios.get(API_URL + 'user/');
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return getCurrentUser();
      }
    }
    throw error;
  }
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    logout();
    return false;
  }
  try {
    const response = await axios.post(API_URL + 'token/refresh/', {
      refresh: refreshToken,
    });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      setAuthToken(response.data.access);
      return true;
    }
  } catch (error) {
    logout();
    return false;
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