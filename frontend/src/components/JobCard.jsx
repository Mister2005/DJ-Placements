import React from 'react'
import { motion } from 'framer-motion'
import { Bookmark, Briefcase, Building2, Calendar, Check, ChevronRight, IndianRupee, MapPin, X } from 'lucide-react'

function formatDate(date) {
  if (!date) return 'Date not set'
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function JobCard({ job, isSaved, onSave, onApply, matchScore }) {
  const skills = job.skills || []
  const hasSkillMatch = job.matched_skills && job.missing_skills

  return (
    <motion.article
      layout
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16 }}
      className="command-surface group cursor-pointer overflow-hidden transition hover:border-primary/35 hover:shadow-md"
      onClick={() => onApply(job.id)}
    >
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-secondary-border bg-white/70 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-bold tracking-tight text-foreground group-hover:text-primary">{job.role}</h3>
              <p className="mt-1 truncate text-sm font-medium text-secondary-foreground">{job.company}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {matchScore !== undefined && matchScore > 0 && (
              <span className={`status-pill ${matchScore >= 70 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : matchScore >= 40 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {matchScore}% fit
              </span>
            )}
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); onSave(job.id) }}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition ${isSaved ? 'border-primary bg-blue-50 text-primary' : 'border-secondary-border bg-white text-secondary-foreground hover:bg-secondary hover:text-foreground'}`}
              aria-label={isSaved ? 'Remove saved job' : 'Save job'}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetaItem icon={MapPin} label="Location" value={job.location || 'Not specified'} />
          <MetaItem icon={Calendar} label="Deadline" value={formatDate(job.last_date_to_apply)} />
          <MetaItem icon={Briefcase} label="Type" value={job.job_type || job.jobType || 'Role'} />
          <MetaItem icon={IndianRupee} label="Compensation" value={job.salary || 'Not disclosed'} tone={job.salary ? 'green' : 'default'} />
        </div>

        <div className="flex flex-col gap-4 border-t border-secondary-border pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
              {hasSkillMatch ? 'Skill coverage' : 'Required skills'}
            </p>
            <div className="flex flex-wrap gap-2">
              {hasSkillMatch ? (
                <>
                  {job.matched_skills.slice(0, 4).map((skill) => (
                    <span key={`matched-${skill}`} className="status-pill border-emerald-200 bg-emerald-50 text-emerald-700">
                      <Check className="h-3.5 w-3.5" /> {skill}
                    </span>
                  ))}
                  {job.missing_skills.slice(0, 2).map((skill) => (
                    <span key={`missing-${skill}`} className="status-pill border-slate-200 bg-slate-50 text-slate-600">
                      <X className="h-3.5 w-3.5" /> {skill}
                    </span>
                  ))}
                </>
              ) : (
                <>
                  {skills.slice(0, 5).map((skill) => (
                    <span key={skill} className="status-pill border-blue-200 bg-blue-50 text-blue-700">{skill}</span>
                  ))}
                  {skills.length > 5 && <span className="status-pill border-slate-200 bg-slate-50 text-slate-600">+{skills.length - 5} more</span>}
                  {skills.length === 0 && <span className="text-sm text-secondary-foreground">Skills not listed</span>}
                </>
              )}
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition group-hover:translate-x-0.5">
            Review role <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </motion.article>
  )
}

function MetaItem({ icon: Icon, label, value, tone = 'default' }) {
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${tone === 'green' ? 'border-emerald-200 bg-emerald-50' : 'border-secondary-border bg-white/60'}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className={`mt-1 truncate text-sm font-semibold ${tone === 'green' ? 'text-emerald-800' : 'text-foreground'}`}>{value}</p>
    </div>
  )
}

export function SkeletonJobCard() {
  return (
    <div className="command-surface p-6">
      <div className="animate-pulse">
        <div className="mb-5 flex gap-4">
          <div className="h-12 w-12 rounded-lg bg-slate-200" />
          <div className="flex-1">
            <div className="mb-2 h-5 w-1/2 rounded bg-slate-200" />
            <div className="h-4 w-1/3 rounded bg-slate-100" />
          </div>
        </div>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-16 rounded-lg bg-slate-100" />
          <div className="h-16 rounded-lg bg-slate-100" />
          <div className="h-16 rounded-lg bg-slate-100" />
          <div className="h-16 rounded-lg bg-slate-100" />
        </div>
        <div className="h-8 w-2/3 rounded bg-slate-100" />
      </div>
    </div>
  )
}
