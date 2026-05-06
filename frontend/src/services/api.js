import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (data) => api.post('/auth/signup', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadResume: (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    return api.post('/auth/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const jobService = {
  getAllJobs: () => api.get('/jobs'),
  getJobById: (id) => api.get(`/jobs/${id}`),
  searchJobs: (query) => api.get('/jobs/search', { params: { q: query } }),
  filterJobs: (filters) => api.get('/jobs/filter', { params: filters }),
  getJobDeadlines: () => api.get('/jobs/deadlines'),
  bookmarkJob: (jobId) => api.post(`/jobs/${jobId}/bookmark`),
  removeBookmark: (jobId) => api.delete(`/jobs/${jobId}/bookmark`),
  getBookmarks: () => api.get('/jobs/bookmarks'),
}

export const applicationService = {
  applyForJob: (jobId, data) => api.post(`/applications/apply/${jobId}`, data),
  getApplications: () => api.get('/applications'),
  getApplicationStatus: (jobId) => api.get(`/applications/${jobId}`),
  withdrawApplication: (jobId) => api.delete(`/applications/${jobId}`),
  getApplicationTimeline: (jobId) => api.get(`/applications/${jobId}/timeline`)
}

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (preferences) => api.put('/notifications/preferences', preferences),
}

export const resumeService = {
  parseResume: (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    return api.post('/resume/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  skillMatching: (jobId) => api.get(`/resume/match/${jobId}`),
  autoMatchJobs: () => api.get('/resume/auto-match'),
}

export const communityService = {
  getMessages: () => api.get('/community/messages'),
  postMessage: (message) => api.post('/community/messages', { message }),
  deleteMessage: (messageId) => api.delete(`/community/messages/${messageId}`),
  replyToMessage: (messageId, reply) => api.post(`/community/messages/${messageId}/reply`, { reply })
}

export default api
