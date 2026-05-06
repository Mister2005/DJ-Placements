import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, useNotificationStore } from '../context/store'
import { notificationService } from '../services/api'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { notifications, setNotifications } = useNotificationStore()
  const notifRef = useRef(null)

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationService.getNotifications()
        setNotifications(res.data.notifications)
      } catch (err) {
        console.error('Failed to fetch notifications')
      }
    }
    if (user) fetchNotifs()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.error('Failed to mark as read')
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="font-bold text-lg text-gray-900">PlaceHub</span>
            </Link>
          </div>

          {user && (
            <>
              <div className="hidden md:flex items-center gap-8">
                <Link to="/jobs" className="text-gray-600 hover:text-gray-900">Jobs</Link>
                <Link to="/deadlines" className="text-gray-600 hover:text-gray-900">Deadlines</Link>
                <Link to="/applications" className="text-gray-600 hover:text-gray-900">Applications</Link>
                <Link to="/community" className="text-gray-600 hover:text-gray-900">Community</Link>
              </div>

              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="relative p-2 text-gray-600 hover:text-gray-900"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-3 border-b bg-gray-50 rounded-t-lg">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      {notifications.length > 0 ? (
                        <div>
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.is_read ? 'bg-blue-50' : ''}`}
                              onClick={() => handleMarkRead(notif.id)}
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-lg">
                                  {notif.type === 'job' ? '💼' : notif.type === 'application' ? '📋' : notif.type === 'deadline' ? '⏰' : '🔔'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                </div>
                                {!notif.is_read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-gray-500 text-sm">
                          No notifications yet
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.name}`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  </div>
                </div>

                <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Logout
                </button>
              </div>

              <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {isOpen && user && (
        <div className="md:hidden bg-gray-50 border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/jobs" className="block px-3 py-2 rounded-md text-gray-600 hover:bg-gray-200">Jobs</Link>
            <Link to="/deadlines" className="block px-3 py-2 rounded-md text-gray-600 hover:bg-gray-200">Deadlines</Link>
            <Link to="/applications" className="block px-3 py-2 rounded-md text-gray-600 hover:bg-gray-200">Applications</Link>
            <Link to="/community" className="block px-3 py-2 rounded-md text-gray-600 hover:bg-gray-200">Community</Link>
            <Link to="/profile" className="block px-3 py-2 rounded-md text-gray-600 hover:bg-gray-200">Profile</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
