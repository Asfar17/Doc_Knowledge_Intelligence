import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const documentsAPI = {
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getDocuments: () => api.get('/documents'),
  getGraphData: () => api.get('/documents/graph/data'),
};

export const queryAPI = {
  sendQuery: (query: string) => api.post('/query', { query }),
};

export const complianceAPI = {
  analyzeDocument: (document_id: number, report_type: string, standards: string[]) => api.post('/compliance/analyze', { document_id, report_type, standards }),
  getReportsByDocument: (document_id: number) => api.get(`/compliance/reports/${document_id}`),
  getReport: (report_id: number) => api.get(`/compliance/report/${report_id}`),
};

export default api;
