import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: (userData) => set({ user: userData, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateProfile: (updates) => set((state) => ({
    user: { ...state.user, ...updates }
  }))
}))

export const useJobStore = create((set) => ({
  jobs: [],
  filteredJobs: [],
  savedjobs: [],
  appliedJobs: [],

  setJobs: (jobs) => set({ jobs, filteredJobs: jobs }),
  filterJobs: (filters) => set((state) => ({
    filteredJobs: state.jobs.filter((job) => {
      if (filters.domain && job.domain !== filters.domain) return false
      if (filters.location && !job.location.includes(filters.location)) return false
      if (filters.jobType && (job.job_type || job.jobType) !== filters.jobType) return false
      if (filters.search) {
        const search = filters.search.toLowerCase()
        return (
          job.company.toLowerCase().includes(search) ||
          job.role.toLowerCase().includes(search) ||
          job.skills.some(s => s.toLowerCase().includes(search))
        )
      }
      return true
    })
  })),
  setSavedJobs: (savedJobs) => set({ savedjobs: savedJobs }),
  toggleSaveJob: (jobId) => set((state) => ({
    savedjobs: state.savedjobs.includes(jobId)
      ? state.savedjobs.filter(id => id !== jobId)
      : [...state.savedjobs, jobId]
  })),
  applyForJob: (jobId, application) => set((state) => ({
    appliedJobs: [...state.appliedJobs, { jobId, ...application }]
  }))
}))

export const useNotificationStore = create((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({
    notifications: [{ id: Date.now(), ...notification }, ...state.notifications]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}))
