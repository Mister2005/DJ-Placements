import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase, Calendar, Check, IndianRupee, MapPin, ShieldCheck } from 'lucide-react'
import { Button, LoadingState, Modal } from '../components/Common'
import { SkillMatcher } from '../components/FeatureComponents'
import { applicationService, jobService, resumeService } from '../services/api'

export default function JobDetailsPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [skillMatch, setSkillMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const [jobRes, matchRes] = await Promise.all([
          jobService.getJobById(jobId),
          resumeService.skillMatching(jobId)
        ])
        setJob(jobRes.data.job)
        setHasApplied(jobRes.data.has_applied)
        setSkillMatch(matchRes.data)
      } catch (err) {
        console.error('Failed to fetch job details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [jobId])

  const handleApply = async () => {
    setApplying(true)
    try {
      await applicationService.applyForJob(jobId, {})
      setHasApplied(true)
      setShowApplyModal(false)
    } catch (err) {
      console.error('Failed to apply:', err)
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <LoadingState label="Loading job brief" />

  if (!job) {
    return (
      <main className="page-shell flex items-center justify-center">
        <div className="section-card max-w-md p-8 text-center">
          <h1 className="text-xl font-bold text-foreground">Job not found</h1>
          <p className="mt-2 text-sm text-secondary-foreground">The role may have been removed or the link is no longer valid.</p>
          <Button className="mt-5" variant="secondary" onClick={() => navigate('/jobs')}>Back to jobs</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <div className="mx-auto w-full">
        <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <section className="section-card overflow-hidden">
          <div className="border-b border-secondary-border p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap gap-2">
                  {job.domain && <span className="status-pill border-blue-200 bg-blue-50 text-blue-700">{job.domain}</span>}
                  {job.job_type && <span className="status-pill border-slate-200 bg-slate-50 text-slate-700">{job.job_type}</span>}
                  {job.location && <span className="status-pill border-violet-200 bg-violet-50 text-violet-700">{job.location}</span>}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{job.role}</h1>
                <p className="mt-2 text-lg font-medium text-secondary-foreground">{job.company}</p>
              </div>
              <Button size="lg" variant={hasApplied ? 'secondary' : 'primary'} onClick={() => setShowApplyModal(true)} disabled={hasApplied}>
                {hasApplied ? <Check className="h-5 w-5" /> : null}
                {hasApplied ? 'Application submitted' : 'Apply now'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 border-b border-secondary-border p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
            <SummaryItem icon={IndianRupee} label="Salary or stipend" value={job.salary || 'Not disclosed'} />
            <SummaryItem icon={Calendar} label="Application deadline" value={new Date(job.last_date_to_apply).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} />
            <SummaryItem icon={ShieldCheck} label="Eligibility" value={job.eligibility || 'See details'} />
            <SummaryItem icon={MapPin} label="Location" value={job.location || 'Not specified'} />
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-8">
            <div className="space-y-8">
              <ContentSection title="About the role">
                <p className="leading-7 text-slate-700">{job.description}</p>
              </ContentSection>

              {job.responsibilities?.length > 0 && (
                <ContentSection title="Responsibilities">
                  <ul className="space-y-3">
                    {job.responsibilities.map((responsibility) => (
                      <li key={responsibility} className="flex gap-3 text-sm leading-6 text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </ContentSection>
              )}

              {job.benefits?.length > 0 && (
                <ContentSection title="What you get">
                  <ul className="space-y-3">
                    {job.benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-3 text-sm leading-6 text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </ContentSection>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-lg border border-secondary-border bg-slate-50 p-5">
                <h3 className="text-base font-bold text-foreground">Required skills</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills?.length > 0 ? job.skills.map((skill) => (
                    <span key={skill} className="status-pill border-blue-200 bg-blue-50 text-blue-700">{skill}</span>
                  )) : (
                    <p className="text-sm text-secondary-foreground">No skills listed for this role.</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-secondary-border bg-slate-50 p-5">
                <h3 className="text-base font-bold text-foreground">Eligibility</h3>
                <p className="mt-2 text-sm leading-6 text-secondary-foreground">{job.eligibility || 'Eligibility criteria have not been published.'}</p>
              </div>
            </aside>
          </div>
        </section>

        {skillMatch && (
          <div className="mt-6">
            <SkillMatcher matchPercentage={skillMatch.match_percentage} matchedSkills={skillMatch.matched_skills} missingSkills={skillMatch.missing_skills} />
          </div>
        )}

        <Modal isOpen={showApplyModal} title="Submit application" onClose={() => setShowApplyModal(false)} onConfirm={handleApply} confirmText={applying ? 'Submitting' : 'Submit application'}>
          <p>Submit your application for <strong>{job.role}</strong> at <strong>{job.company}</strong>.</p>
          <p className="mt-3 text-secondary-foreground">Your current profile and latest resume will be attached. Review them before submitting if anything has changed.</p>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            You can track status changes from the Applications page after submission.
          </div>
        </Modal>
      </div>
    </main>
  )
}

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-secondary-border bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary-foreground">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <p className="text-base font-bold text-foreground">{value}</p>
    </div>
  )
}

function ContentSection({ title, children }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-foreground">
        <Briefcase className="h-5 w-5 text-primary" /> {title}
      </h2>
      {children}
    </section>
  )
}
