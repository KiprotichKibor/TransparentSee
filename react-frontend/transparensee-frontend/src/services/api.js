import axios from "axios";

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepting requests to include the JWT token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token'); // Changed to 'access_token' to match AuthContext
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Intercepting responses to handle errors centrally
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
          // Redirect to login page or refresh token
            window.location.href = '/login';
        }
        return Promise.reject(error.response ? error.response.data : error);
    }
);

export const getReports = async (params) => {
    try {
      const response = await api.get('/reports/', { params });
      return response;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  };

export const getReport = async (id) => {
    return await api.get(`/reports/${id}/`);
};

export const getRecentReports = async (limit) => {
    return await api.get(`/dash-reports/recent/?limit=${limit}`);
  };
  
export const getRecentInvestigations = async (limit) => {
    return await api.get(`/dash-investigations/recent/?limit=${limit}`);
  };

export const createReport = async (formData) => {
    try {
        const response = await api.post('/reports/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error.response || error);
        throw error;
    }
};

export const getRegions = async () => {
    return await api.get('/regions/');
};

export const startInvestigation = async (reportId) => {
    return await api.post(`/reports/${reportId}/start_investigation/`);
};

export const updateInvestigationStatus = async (investigationId, status) => {
    return await api.post(`/investigations/${investigationId}/update-status/`, { status });
};

export const getInvestigations = async (params) => {
    try {
      const response = await api.get('/investigations/', { params });
      return response;
    } catch (error) {
      console.error('Error fetching investigations:', error);
      throw error;
    }
  };


export const getInvestigation = async (id) => {
    if (!id) throw new Error('Investigation ID is missing');
    try {
        const response = await api.get(`/investigations/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch investigation:', error);
        throw error;
    }
};

export const createContribution = async (investigationId, formData) => {
    return await api.post(`/investigations/${investigationId}/contributions/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const addContribution = async (investigationId, data) => {
    return await api.post(`/investigations/${investigationId}/contributions/`, data);
};

export const voteContribution = async (investiagtionId, contributionId, vote) => {
    return await api.post(`/investigations/${investiagtionId}/vote-contribution/`, { contribution_id: contributionId, vote });
};

export const assignRole = async (investigationId, userId, role) => {
    return await api.post(`/investigations/${investigationId}/assign-role/`, { user_id: userId, role });
};

export const createTask = async (investigationId, taskData) => {
    return await api.post(`/investigations/${investigationId}/create-task/`, taskData);
};

export const getUserProfile = async (username) => {
    return await api.get(`/profiles/${username}/`);
};

export const getUserStats = async (userId) => {
    if (!userId) {
        console.error('getUserStats called with undefined userId');
        return Promise.reject('User ID is undefined')
    }
    return await api.get(`/dash-users/${userId}/stats/`);
  };

export const updateProfile = async (username, data) => {
    return await api.patch(`/profile/${username}/`, data);
};

export const getNotifications = async () => {
    return await api.get('/notifications/');
};

export const markNotificationAsRead = async (id) => {
    return await api.post(`/notifications/${id}/read/`);
};

export const getComments = async (reportId) => {
    return await api.get(`/reports/${reportId}/comments/`);
};

export const createComment = async (reportId, data) => {
    return await api.post(`/reports/${reportId}/comments/`, data);
};

export const getStats = async () => {
    return await api.get('/stats/');
};

export const getUserRole = async () => {
    return await api.get('/user-role/');
};

export const getUsers = async () => {
    return await api.get('/users/');
};

export const updateUserRole = async (userId, role) => {
    return await api.patch(`/users/${userId}/`, { role });
};

export const updateUserProfile = async (username, data) => {
    return await api.patch(`/profile/${username}/`, data);
};

export const updateReportStatus = async (reportId, status) => {
    return await api.patch(`/reports/${reportId}/`, { status });
};

export default api;