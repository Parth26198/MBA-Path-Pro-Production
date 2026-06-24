import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Request failed';
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject({ message, status: err.response?.status, errors: err.response?.data?.errors });
  }
);

export const publicApi = {
  packages: () => api.get('/public/packages'),
  colleges: (params) => api.get('/public/colleges', { params }),
  featuredColleges: () => api.get('/public/colleges/featured'),
  college: (slug) => api.get(`/public/colleges/${slug}`),
  stats: () => api.get('/public/stats'),
  contact: (data) => api.post('/public/contact', data),
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const notificationApi = {
  list: (params) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const paymentApi = {
  razorpayKey: () => api.get('/payments/razorpay-key'),
  createOrder: (packageId) => api.post('/student/payments/create-order', { package_id: packageId }),
  verify: (data) => api.post('/student/payments/verify', data),
  failed: (data) => api.post('/student/payments/failed', data),
  history: () => api.get('/student/payments/history'),
};

export const uploadApi = {
  document: (formData) =>
    api.post('/uploads/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  collegeImage: (formData) =>
    api.post('/uploads/college-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  students: () => api.get('/admin/students'),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  trainers: () => api.get('/admin/trainers'),
  createTrainer: (data) => api.post('/admin/trainers', data),
  updateTrainer: (id, data) => api.put(`/admin/trainers/${id}`, data),
  deleteTrainer: (id) => api.delete(`/admin/trainers/${id}`),
  assignTrainer: (studentId, trainerId) =>
    api.post(`/admin/students/${studentId}/assign-trainer`, { trainer_id: trainerId }),
  applications: () => api.get('/admin/applications'),
  colleges: (params) => api.get('/admin/colleges', { params }),
  updateCollege: (id, data) => api.put(`/admin/colleges/${id}`, data),
  deleteCollege: (id) => api.delete(`/admin/colleges/${id}`),
  approveCollege: (id, approved) => api.post(`/admin/colleges/${id}/approve`, { approved }),
  featureCollege: (id, featured) => api.post(`/admin/colleges/${id}/feature`, { featured }),
  packages: () => api.get('/admin/packages'),
  createPackage: (data) => api.post('/admin/packages', data),
  updatePackage: (id, data) => api.put(`/admin/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/admin/packages/${id}`),
  payments: (params) => api.get('/admin/payments', { params }),
  documents: (params) => api.get('/admin/documents', { params }),
  auditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

export const trainerApi = {
  dashboard: () => api.get('/trainer/dashboard'),
  students: () => api.get('/trainer/students'),
  applications: () => api.get('/trainer/applications'),
  applicationStatuses: () => api.get('/trainer/applications/statuses'),
  updateApplication: (id, data) => api.put(`/trainer/applications/${id}`, data),
  updateChecklist: (itemId, data) => api.patch(`/trainer/checklist/${itemId}`, data),
  addTimeline: (data) => api.post('/trainer/timeline', data),
  preparation: (params) => api.get('/trainer/preparation', { params }),
  createPreparation: (data) => api.post('/trainer/preparation', data),
  updatePreparation: (id, data) => api.put(`/trainer/preparation/${id}`, data),
  sessions: (params) => api.get('/trainer/sessions', { params }),
  createSession: (data) => api.post('/trainer/sessions', data),
  updateSession: (id, data) => api.put(`/trainer/sessions/${id}`, data),
  colleges: (params) => api.get('/trainer/colleges', { params }),
  getCollege: (id) => api.get(`/trainer/colleges/${id}`),
  createCollege: (data) => api.post('/trainer/colleges', data),
  updateCollege: (id, data) => api.put(`/trainer/colleges/${id}`, data),
  deleteCollege: (id) => api.delete(`/trainer/colleges/${id}`),
  submitCollege: (id) => api.post(`/trainer/colleges/${id}/submit`),
  documents: (params) => api.get('/trainer/documents', { params }),
  verifyDocument: (id, data) => api.post(`/trainer/documents/${id}/verify`, data),
};

export const studentApi = {
  dashboard: () => api.get('/student/dashboard'),
  packages: () => api.get('/student/packages'),
  subscription: () => api.get('/student/subscription'),
  profile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  universities: (params) => api.get('/student/universities', { params }),
  university: (slug) => api.get(`/student/universities/${slug}`),
  compareUniversities: (ids) => api.get('/student/universities/compare', { params: { ids } }),
  savedUniversities: () => api.get('/student/saved-universities'),
  saveUniversity: (collegeId) => api.post(`/student/saved-universities/${collegeId}`),
  unsaveUniversity: (collegeId) => api.delete(`/student/saved-universities/${collegeId}`),
  recommendedUniversities: () => api.get('/student/recommendations/universities'),
  recommendedPrograms: () => api.get('/student/recommendations/programs'),
  programs: (params) => api.get('/student/programs', { params }),
  applications: () => api.get('/student/applications'),
  availableColleges: () => api.get('/student/colleges/available'),
  applyCollege: (collegeId) => api.post('/student/applications', { college_id: collegeId }),
  documents: () => api.get('/student/documents'),
  completePreparation: (id, notes) => api.patch(`/student/preparation/${id}/complete`, { notes }),
};
