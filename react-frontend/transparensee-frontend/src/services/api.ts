import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptors to include the token in requests
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  export const register = (userData: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
  }) => api.post('/register/', userData);
  export const login = (credentials: {
    email: string;
    password: string;
  }) => api.post('/token/', credentials);
  export const logout = () => api.post('/logout/');
  
  export const getReports = () => api.get('/reports/');
  export const getReport = (id: number) => api.get(`/reports/${id}/`);
  export const createReport = (reportData: any) => api.post('/reports/', reportData);
  export const updateReport = (id: number, reportData: any) => api.put(`/reports/${id}/`, reportData);
  export const deleteReport = (id: number) => api.delete(`/reports/${id}/`);
  
  export const getInvestigations = () => api.get('/investigations/');
  export const getInvestigation = (id: number) => api.get(`/investigations/${id}/`);
  export const startInvestigation = (reportId: number) => api.post(`/investigations/`, { report: reportId });
  export const updateInvestigationStatus = (id: number, status: string) => api.post(`/investigations/${id}/update_status/`, { status });
  
  export const getContributions = (investigationId: number) => api.get(`/contributions/?investigation=${investigationId}`);
  export const createContribution = (contributionData: any) => api.post('/contributions/', contributionData);
  export const verifyContribution = (id: number) => api.post(`/contributions/${id}/verify/`);
  
  export const getCaseReports = () => api.get('/case-reports/');
  export const generateCaseReport = (investigationId: number) => api.post('/case-reports/generate/', { investigation: investigationId });
  export const downloadCaseReport = (id: number) => api.get(`/case-reports/${id}/download_pdf/`, { responseType: 'blob' });
  
  export const getUserProfile = () => api.get('/user-profiles/me/');
  export const updateUserProfile = (profileData: any) => api.put('/user-profiles/me/', profileData);
  
  export const getBadges = () => api.get('/badges/');
  
  export default api;