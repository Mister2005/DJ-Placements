import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, useNotificationStore } from '../context/store'
import { applicationService, jobService, notificationService } from '../services/api'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { notifications, setNotifications } = useNotificationStore()
  const [recentApplications, setRecentApplications] = useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])
  const [stats, setStats] = useState({ applications: 0, savedJobs: 0, interviews: 0, notifications: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appsRes, deadlinesRes, notifRes, bookmarksRes] = await Promise.all([
          applicationService.getApplications(),
          jobService.getJobDeadlines(),
          notificationService.getNotifications(),
          jobService.getBookmarks()
        ])

        const apps = appsRes.data.applications
        setRecentApplications(apps.slice(0, 3))
        setUpcomingDeadlines(deadlinesRes.data.deadlines.slice(0, 3))
        setNotifications(notifRes.data.notifications)

        const interviewCount = apps.filter(a => a.status === 'interview_scheduled').length
        setStats({
          applications: apps.length,
          savedJobs: bookmarksRes.data.bookmarks.length,
          interviews: interviewCount,
          notifications: notifRes.data.notifications.length
        })
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const statCards = [
    { label: 'Applications', value: stats.applications, icon: '📝', color: 'bg-blue-100 text-blue-600' },
    { label: 'Saved Jobs', value: stats.savedJobs, icon: '❤️', color: 'bg-red-100 text-red-600' },
    { label: 'Interview Rounds', value: stats.interviews, icon: '📞', color: 'bg-purple-100 text-purple-600' },
    { label: 'Notifications', value: stats.notifications, icon: '🔔', color: 'bg-yellow-100 text-yellow-600' },
  ]

  const statusColors = {
    applied: 'text-blue-600',
    shortlisted: 'text-purple-600',
    interview_scheduled: 'text-cyan-600',
    selected: 'text-green-600',
    rejected: 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600 mt-2">Track your applications and explore new opportunities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 border-b-4 border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`text-4xl p-4 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span> Recent Applications
              </h2>
              <div className="space-y-3">
                {recentApplications.length > 0 ? recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.role}</h3>
                      <p className="text-sm text-gray-500">{app.company}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-semibold ${statusColors[app.status]}`}>
                        {app.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">No applications yet. Start exploring jobs!</p>
                )}
              </div>
              <Link to="/applications" className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium">
                View All Applications
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>⏱️</span> Upcoming Deadlines
              </h2>
              <div className="space-y-3">
                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((deadline, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                    deadline.days_remaining <= 2 ? 'border-red-500 bg-red-50' :
                    deadline.days_remaining <= 5 ? 'border-yellow-500 bg-yellow-50' :
                    'border-green-500 bg-green-50'
                  }`}>
                    <h4 className="font-semibold text-gray-900">{deadline.role}</h4>
                    <p className="text-xs text-gray-600 mt-1">{deadline.company}</p>
                    <p className={`text-sm font-bold mt-2 ${
                      deadline.days_remaining <= 2 ? 'text-red-600' :
                      deadline.days_remaining <= 5 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {deadline.days_remaining} days left
                    </p>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
                )}
              </div>
              <Link to="/deadlines" className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                See All Deadlines
              </Link>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white">
              <h2 className="text-lg font-bold mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link to="/jobs" className="block p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all">
                  🔍 Explore Jobs
                </Link>
                <Link to="/profile" className="block p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all">
                  👤 Update Profile
                </Link>
                <Link to="/community" className="block p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all">
                  💬 Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
