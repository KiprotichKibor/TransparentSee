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

export const getReports = async () => {
    return await api.get('/reports');
}
export const getReport = async (id) => {
    return await api.get(`/reports/${id}`);
}
export const createReport = async (data) => {
    return await api.post('/reports', data);
}

export const getInvestigations = async () => {
    return await api.get('/investigations');
}
export const getInvestigation = async (id) => {
    return await api.get(`/investigations/${id}`);
}
export const createContribution = async (investigationId, data) => {
    return await api.post(`/investigations/${investigationId}/contributions`, data);
}

export default api;