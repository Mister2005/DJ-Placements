import React from 'react'
import { Check, Clock, X } from 'lucide-react'

export function SkillMatcher({ matchPercentage, matchedSkills = [], missingSkills = [] }) {
  const tone = matchPercentage >= 70 ? 'emerald' : matchPercentage >= 40 ? 'amber' : 'red'
  const toneStyles = {
    emerald: {
      bar: 'bg-emerald-600',
      text: 'text-emerald-700',
      missing: 'border-emerald-200 bg-emerald-50 text-emerald-700'
    },
    amber: {
      bar: 'bg-amber-500',
      text: 'text-amber-700',
      missing: 'border-amber-200 bg-amber-50 text-amber-700'
    },
    red: {
      bar: 'bg-red-600',
      text: 'text-red-700',
      missing: 'border-red-200 bg-red-50 text-red-700'
    }
  }[tone]

  return (
    <section className="section-card p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Skill match</h3>
          <p className="mt-1 text-sm text-secondary-foreground">Coverage based on your current profile and resume.</p>
        </div>
        <span className={`text-3xl font-bold ${toneStyles.text}`}>{matchPercentage}%</span>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${toneStyles.bar} transition-all duration-500`} style={{ width: `${Math.min(matchPercentage, 100)}%` }} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SkillGroup title={`Covered skills (${matchedSkills.length})`} skills={matchedSkills} icon={Check} className="border-emerald-200 bg-emerald-50 text-emerald-700" empty="No matching skills yet" />
        <SkillGroup title={`Skills to build (${missingSkills.length})`} skills={missingSkills} icon={X} className={toneStyles.missing} empty="No missing skills listed" />
      </div>
    </section>
  )
}

function SkillGroup({ title, skills, icon: Icon, className, empty }) {
  return (
    <div className="rounded-lg border border-secondary-border bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-foreground">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? skills.map((skill) => (
          <span key={skill} className={`status-pill ${className}`}>
            <Icon className="h-3.5 w-3.5" /> {skill}
          </span>
        )) : (
          <span className="text-sm text-secondary-foreground">{empty}</span>
        )}
      </div>
    </div>
  )
}

export function DeadlineCard({ job, daysRemaining }) {
  const urgency = daysRemaining <= 3 ? 'urgent' : daysRemaining <= 7 ? 'warning' : 'normal'
  const styles = {
    urgent: 'border-red-200 bg-red-50 text-red-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    normal: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  return (
    <article className="section-card p-5 transition hover:border-primary/35 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-foreground">{job.role}</h3>
          <p className="mt-1 text-sm font-medium text-secondary-foreground">{job.company}</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            Apply by {new Date(job.last_date_to_apply).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <span className={`status-pill ${styles[urgency]}`}>
          {daysRemaining <= 0 ? 'Due today' : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`}
        </span>
      </div>
    </article>
  )
}

export function ApplicationStatusBadge({ status }) {
  const statusStyles = {
    applied: 'border-blue-200 bg-blue-50 text-blue-700',
    shortlisted: 'border-violet-200 bg-violet-50 text-violet-700',
    interview_scheduled: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    selected: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rejected: 'border-red-200 bg-red-50 text-red-700'
  }

  const statusLabels = {
    applied: 'Applied',
    shortlisted: 'Shortlisted',
    interview_scheduled: 'Interview scheduled',
    selected: 'Selected',
    rejected: 'Rejected'
  }

  return (
    <span className={`status-pill ${statusStyles[status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
      {statusLabels[status] || status}
    </span>
  )
}
