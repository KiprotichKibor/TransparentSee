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
        // Check if the error response is available and return more informative details
        if (error.response && error.response.data) {
            return Promise.reject(error.response.data);  // Forward backend validation errors
        }
        return Promise.reject(error);
    }
);

export const getReports = async (page = 1, search = '') => {
    return await api.get('/reports/', {
        params: {
            page,
            search,
        },
    });
};

export const getReport = async (id) => {
    return await api.get(`/reports/${id}/`);
};

export const createReport = async (data) => {
    return await api.post('/reports/', data);
};

export const getInvestigations = async (page = 1, search = '') => {
    return await api.get('/investigations/', {
        params: {
            page,
            search,
        },
    });
};

export const getInvestigation = async (id) => {
    return await api.get(`/investigations/${id}/`);
};

export const createContribution = async (investigationId, data) => {
    return await api.post(`/investigations/${investigationId}/contributions/`, data);
};

export const getUserProfile = async (username) => {
    return await api.get(`/users-profiles/${username}/`);
};

export const updateProfile = async (username, data) => {
    return await api.patch(`/users-profiles/${username}/`, data);
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
    return await api.get('/user-roles/');
};

export const getUsers = async () => {
    return await api.get('/users/');
};

export const updateUserRole = async (userId, role) => {
    return await api.patch(`/users/${userId}/`, { role });
};

export const updateUserProfile = async (username, data) => {
    return await api.patch(`/users-profiles/${username}/`, data);
};

export const updateReportStatus = async (reportId, status) => {
    return await api.patch(`/reports/${reportId}/`, { status });
};

export default api;