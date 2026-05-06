import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Briefcase, Calendar, ClipboardList, LayoutDashboard, LogOut, Menu, MessageSquare, User, X } from 'lucide-react'
import { useAuthStore, useNotificationStore } from '../context/store'
import { notificationService } from '../services/api'
import { BrandLogo } from './BrandLogo'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { notifications, setNotifications } = useNotificationStore()
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
  }, [user, setNotifications])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifs(false)
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Applications', path: '/applications', icon: ClipboardList },
    { name: 'Deadlines', path: '/deadlines', icon: Calendar },
    { name: 'Community', path: '/community', icon: MessageSquare },
  ]

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map((notification) => (
        notification.id === id ? { ...notification, is_read: true } : notification
      )))
    } catch (err) {
      console.error('Failed to mark notification as read')
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.is_read).length
  const firstName = user?.name?.split(' ')[0] || 'Student'

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.18 }}
      className={`glass-nav fixed inset-x-0 top-0 z-50 border-b transition ${scrolled ? 'border-secondary-border' : 'border-transparent'}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-3 rounded-lg" aria-label="Rolewise dashboard">
            <BrandLogo compact />
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-none text-foreground">Rolewise</p>
              <p className="mt-0.5 text-[11px] font-medium text-secondary-foreground">Placement OS</p>
            </div>
          </Link>

          {user && (
            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path)
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`nav-chip ${isActive ? 'nav-chip-active' : 'nav-chip-idle'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-secondary-border bg-white/70 text-secondary-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.16 }}
                    className="command-surface absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-secondary-border px-4 py-3">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                        <p className="text-xs text-secondary-foreground">{unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'No unread updates'}</p>
                      </div>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => handleMarkRead(notification.id)}
                            className={`mb-1 w-full rounded-lg border p-3 text-left transition last:mb-0 ${notification.is_read ? 'border-transparent hover:bg-secondary' : 'border-blue-200 bg-blue-50 hover:bg-blue-100'}`}
                          >
                            <div className="flex gap-3">
                              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary">
                                {notification.type === 'application' ? <ClipboardList className="h-4 w-4" /> : notification.type === 'deadline' ? <Calendar className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">{notification.title}</p>
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-secondary-foreground">{notification.message}</p>
                                <p className="mt-2 text-[11px] font-medium text-slate-500">{new Date(notification.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-6 py-10 text-center">
                          <Bell className="mx-auto h-8 w-8 text-slate-300" />
                          <p className="mt-3 text-sm font-medium text-foreground">Nothing needs your attention</p>
                          <p className="mt-1 text-xs text-secondary-foreground">Application and deadline updates will appear here.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="hidden items-center gap-2 rounded-lg border border-secondary-border bg-white/70 py-1.5 pl-2.5 pr-2 transition hover:bg-secondary sm:flex"
              >
                <span className="max-w-28 truncate text-sm font-semibold text-foreground">{firstName}</span>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=2557d6&color=fff`}
                  alt=""
                  className="h-7 w-7 rounded-lg"
                />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.16 }}
                    className="command-surface absolute right-0 mt-2 w-64 overflow-hidden shadow-xl"
                  >
                    <div className="border-b border-secondary-border px-4 py-3">
                      <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
                      <p className="mt-0.5 truncate text-xs text-secondary-foreground">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-foreground transition hover:bg-secondary hover:text-foreground"
                      >
                        <User className="h-4 w-4" /> Profile settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-secondary-border bg-white/70 text-secondary-foreground transition hover:bg-secondary hover:text-foreground lg:hidden"
              onClick={() => setIsOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && user && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 right-0 z-50 w-[min(22rem,90vw)] border-l border-card-border bg-white p-4 shadow-xl lg:hidden"
            >
              <div className="mb-5 flex items-center justify-between border-b border-secondary-border pb-4">
                <div>
                  <p className="font-bold text-foreground">Rolewise</p>
                  <p className="text-xs text-secondary-foreground">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-secondary-foreground transition hover:bg-secondary hover:text-foreground"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname.startsWith(link.path)
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-primary text-white' : 'text-secondary-foreground hover:bg-secondary hover:text-foreground'}`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.name}
                    </Link>
                  )
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
