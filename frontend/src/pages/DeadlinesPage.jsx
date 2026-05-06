import React, { useEffect, useState } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, Clock } from 'lucide-react'
import { DeadlineCard } from '../components/FeatureComponents'
import { EmptyState, LoadingState, PageHeader } from '../components/Common'
import { jobService } from '../services/api'

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const res = await jobService.getJobDeadlines()
        setDeadlines(res.data.deadlines || [])
      } catch (err) {
        console.error('Failed to fetch deadlines:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDeadlines()
  }, [])

  if (loading) return <LoadingState label="Loading deadlines" />

  const sortedDeadlines = [...deadlines].sort((a, b) => a.days_remaining - b.days_remaining)
  const urgentCount = sortedDeadlines.filter((deadline) => deadline.days_remaining <= 3).length
  const warningCount = sortedDeadlines.filter((deadline) => deadline.days_remaining > 3 && deadline.days_remaining <= 7).length
  const normalCount = sortedDeadlines.filter((deadline) => deadline.days_remaining > 7).length

  return (
    <main className="page-shell">
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader
          eyebrow="Time-sensitive"
          title="Application deadlines"
          description="Prioritize the roles that are closest to closing and avoid last-minute submissions."
        />

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <DeadlineSummary icon={AlertTriangle} label="Urgent" value={urgentCount} helper="3 days or less" className="border-red-200 bg-red-50 text-red-700" />
          <DeadlineSummary icon={Clock} label="Due soon" value={warningCount} helper="4 to 7 days" className="border-amber-200 bg-amber-50 text-amber-700" />
          <DeadlineSummary icon={CheckCircle2} label="Upcoming" value={normalCount} helper="More than 7 days" className="border-emerald-200 bg-emerald-50 text-emerald-700" />
        </div>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Sorted by urgency</h2>
              <p className="mt-1 text-sm text-secondary-foreground">Closest deadlines appear first.</p>
            </div>
          </div>

          {sortedDeadlines.length > 0 ? (
            <div className="space-y-3">
              {sortedDeadlines.map((deadline) => <DeadlineCard key={deadline.id || `${deadline.company}-${deadline.role}`} job={deadline} daysRemaining={deadline.days_remaining} />)}
            </div>
          ) : (
            <EmptyState icon={CalendarClock} title="No upcoming deadlines" description="When active jobs have application dates, they will appear here in priority order." />
          )}
        </section>

        <section className="section-card mt-8 p-5">
          <h3 className="text-lg font-bold text-foreground">Submission checklist</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {['Apply at least two days before the deadline.', 'Confirm your resume is the latest version.', 'Review eligibility before starting the form.', 'Keep notifications enabled for status changes.'].map((tip) => (
              <div key={tip} className="flex gap-3 rounded-lg border border-secondary-border bg-slate-50 p-3 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function DeadlineSummary({ icon: Icon, label, value, helper, className }) {
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          <p className="mt-1 text-xs opacity-80">{helper}</p>
        </div>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  )
}
