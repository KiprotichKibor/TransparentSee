import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getReports = async () => {
    const response = await api.get('/reports');
    return response.data;
};

export const createReport = async (reportData: any) => {
    const response = await api.post('/reports', reportData);
    return response.data;
};

export const deleteReport = async (id: number) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
};

export const updateReport = async (id: number, reportData: any) => {
    const response = await api.put(`/reports/${id}`, reportData);
    return response.data;
};

export const submitReport = async (reportData: any) => {
    const response = await api.post('/reports', reportData);
    return response.data;
};

export const getInvestigations = async () => {
    const response = await api.get('/investigations');
    return response.data;
};

export const createInvestigation = async (investigationData: any) => {
    const response = await api.post('/investigations', investigationData);
    return response.data;
};

export const deleteInvestigation = async (id: number) => {
    const response = await api.delete(`/investigations/${id}`);
    return response.data;
};

export const updateInvestigation = async (id: number, investigationData: any) => {
    const response = await api.put(`/investigations/${id}`, investigationData);
    return response.data;
};

export const getUserProfile = async () => {
    const response = await api.get('/profile');
    return response.data;
};

export default api;