import axios from "axios";

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export const getReports = async (page = 1, search = '') => {
    return await api.get('/reports/', {
        params: {
            page,
            search,
        },
    });
}
export const getReport = async (id) => {
    return await api.get(`/reports/${id}/`);
}
export const createReport = async (data) => {
    return await api.post('/reports/', data);
}

export const getInvestigations = async (page = 1, search = '') => {
    return await api.get('/investigations/', {
        params: {
            page,
            search,
        },
    });
}
export const getInvestigation = async (id) => {
    return await api.get(`/investigations/${id}/`);
}
export const createContribution = async (investigationId, data) => {
    return await api.post(`/investigations/${investigationId}/contributions/`, data);
}

export const getUserProfile = async (username) => {
    return await api.get('/users-profiles/${username}/');
}

export const updateProfile = async (username, data) => {
    return await api.patch(`/users-profiles/${username}/`, data);
}

export default api;