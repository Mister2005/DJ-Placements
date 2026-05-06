import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Bell, Bookmark, Briefcase, Calendar, ChevronRight, FileText, PhoneCall, Radar, Sparkles } from 'lucide-react'
import { useAuthStore, useNotificationStore } from '../context/store'
import { applicationService, jobService, notificationService } from '../services/api'
import { EmptyState, LoadingState, PageHeader } from '../components/Common'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { setNotifications } = useNotificationStore()
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

        const apps = appsRes.data.applications || []
        const notifications = notifRes.data.notifications || []
        setRecentApplications(apps.slice(0, 4))
        setUpcomingDeadlines((deadlinesRes.data.deadlines || []).slice(0, 4))
        setNotifications(notifications)
        setStats({
          applications: apps.length,
          savedJobs: (bookmarksRes.data.bookmarks || []).length,
          interviews: apps.filter((app) => app.status === 'interview_scheduled').length,
          notifications: notifications.filter((notification) => !notification.is_read).length
        })
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [setNotifications])

  if (loading) return <LoadingState label="Preparing your dashboard" />

  const firstName = user?.name?.split(' ')[0] || 'there'
  const statCards = [
    { label: 'Applications', value: stats.applications, helper: 'Total submitted', icon: FileText, tone: 'blue' },
    { label: 'Saved jobs', value: stats.savedJobs, helper: 'Roles to revisit', icon: Bookmark, tone: 'rose' },
    { label: 'Interviews', value: stats.interviews, helper: 'Scheduled rounds', icon: PhoneCall, tone: 'emerald' },
    { label: 'Unread updates', value: stats.notifications, helper: 'Need attention', icon: Bell, tone: 'amber' },
  ]

  return (
    <main className="page-shell">
      <div className="page-container">
        <section className="command-surface mb-8 p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="ambient-label mb-5"><Radar className="h-3.5 w-3.5" /> Placement command</p>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                {firstName}, your next move is visible.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-secondary-foreground">
                A focused command center for applications, deadlines, resume-fit signals, and the work that moves placement outcomes.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/jobs" className="btn-primary">Scan opportunities <ArrowRight className="h-4 w-4" /></Link>
                <Link to="/profile" className="btn-secondary">Tune profile</Link>
              </div>
            </div>

            <div className="rounded-lg border border-card-border bg-white/70 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Readiness stack</p>
                <span className="status-pill border-blue-200 bg-blue-50 text-blue-700">Live</span>
              </div>
              <div className="space-y-3">
                {[
                  ['Applications', stats.applications],
                  ['Saved roles', stats.savedJobs],
                  ['Interviews', stats.interviews],
                  ['Unread updates', stats.notifications],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-secondary-foreground">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, 22 + value * 12)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <motion.div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}>
          {statCards.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="section-card overflow-hidden">
            <SectionTitle title="Recent applications" description="The latest roles you have submitted." action={<Link to="/applications" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">View all <ArrowRight className="h-4 w-4" /></Link>} />
            <div className="divide-y divide-secondary-border">
              {recentApplications.length > 0 ? recentApplications.map((app, index) => (
              <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="glass-row m-3 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-secondary-border bg-secondary text-sm font-bold text-secondary-foreground">
                      {app.company?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-foreground">{app.role}</h3>
                      <p className="mt-1 text-sm text-secondary-foreground">{app.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <Status status={app.status} />
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </motion.div>
              )) : (
                <div className="p-5">
                  <EmptyState
                    icon={Briefcase}
                    title="No applications yet"
                    description="Start with a few saved roles, then submit when your profile is ready."
                    action={<Link to="/jobs" className="btn-secondary">Browse opportunities</Link>}
                  />
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="section-card overflow-hidden">
              <SectionTitle title="Upcoming deadlines" description="Sorted by urgency." />
              <div className="divide-y divide-secondary-border">
                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((deadline) => (
                  <Link key={deadline.id || `${deadline.company}-${deadline.role}`} to="/deadlines" className="glass-row m-3 block p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-foreground">{deadline.role}</h4>
                        <p className="mt-1 truncate text-xs text-secondary-foreground">{deadline.company}</p>
                      </div>
                      <DeadlinePill days={deadline.days_remaining} />
                    </div>
                  </Link>
                )) : (
                  <div className="p-5 text-center text-sm text-secondary-foreground">No deadlines in the next cycle.</div>
                )}
              </div>
            </section>

            <section className="section-card p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Find stronger matches</h3>
              <p className="mt-2 text-sm leading-6 text-secondary-foreground">Use your resume skills to prioritize roles with the best fit before you spend time applying.</p>
              <Link to="/jobs" className="btn-primary mt-5 w-full">Run auto-match</Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value, helper, icon: Icon, tone }) {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200'
  }

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="metric-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-secondary-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-xs text-secondary-foreground">{helper}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  )
}

function SectionTitle({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-secondary-border px-5 py-4">
      <div>
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-xs text-secondary-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function Status({ status }) {
  const labels = {
    applied: 'Applied',
    shortlisted: 'Shortlisted',
    interview_scheduled: 'Interview',
    selected: 'Selected',
    rejected: 'Rejected'
  }
  const styles = {
    applied: 'border-blue-200 bg-blue-50 text-blue-700',
    shortlisted: 'border-violet-200 bg-violet-50 text-violet-700',
    interview_scheduled: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    selected: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rejected: 'border-red-200 bg-red-50 text-red-700'
  }
  return <span className={`status-pill ${styles[status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>{labels[status] || status}</span>
}

function DeadlinePill({ days }) {
  const style = days <= 2 ? 'border-red-200 bg-red-50 text-red-700' : days <= 5 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
  return <span className={`status-pill shrink-0 ${style}`}>{days <= 0 ? 'Today' : `${days}d`}</span>
}
