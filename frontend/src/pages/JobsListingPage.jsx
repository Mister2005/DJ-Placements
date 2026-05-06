import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { useJobStore } from '../context/store'
import { EmptyState, PageHeader } from '../components/Common'
import { JobCard, SkeletonJobCard } from '../components/JobCard'
import { JobFilters } from '../components/JobFilters'
import { jobService, resumeService } from '../services/api'

export default function JobsListingPage() {
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(true)
  const [autoMatch, setAutoMatch] = useState(false)
  const [autoMatchJobs, setAutoMatchJobs] = useState([])
  const [matchLoading, setMatchLoading] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const navigate = useNavigate()
  const { filteredJobs, setJobs, filterJobs, savedjobs, toggleSaveJob, setSavedJobs } = useJobStore()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const [jobsRes, bookmarksRes] = await Promise.all([
          jobService.getAllJobs(),
          jobService.getBookmarks()
        ])
        setJobs(jobsRes.data.jobs || [])
        setSavedJobs((bookmarksRes.data.bookmarks || []).map((bookmark) => bookmark.job_id))
      } catch (err) {
        console.error('Failed to fetch jobs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [setJobs, setSavedJobs])

  useEffect(() => {
    if (!autoMatch) filterJobs(filters)
  }, [filters, autoMatch, filterJobs])

  const handleAutoMatchToggle = async () => {
    if (autoMatch) {
      setAutoMatch(false)
      setAutoMatchJobs([])
      return
    }
    setMatchLoading(true)
    setAutoMatch(true)
    try {
      const res = await resumeService.autoMatchJobs()
      setAutoMatchJobs(res.data.jobs || [])
    } catch (err) {
      console.error('Failed to auto-match:', err)
      setAutoMatch(false)
    } finally {
      setMatchLoading(false)
    }
  }

  const handleSave = async (jobId) => {
    try {
      if (savedjobs.includes(jobId)) await jobService.removeBookmark(jobId)
      else await jobService.bookmarkJob(jobId)
      toggleSaveJob(jobId)
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
    }
  }

  const displayJobs = autoMatch ? autoMatchJobs : filteredJobs
  const domains = ['Software', 'Product', 'Data', 'Finance', 'Core']
  const locations = ['Bangalore', 'Pune', 'Hyderabad', 'Delhi', 'Mumbai']

  return (
    <main className="page-shell">
      <div className="page-container">
        <PageHeader
          eyebrow="Job discovery"
          title="Explore opportunities"
          description="Search, filter, save, and compare roles before opening the full job brief."
          actions={(
            <>
              <button type="button" onClick={() => setShowMobileFilters(true)} className="btn-secondary lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <button
                type="button"
                onClick={handleAutoMatchToggle}
                disabled={matchLoading}
                className={autoMatch ? 'btn-primary' : 'btn-secondary'}
              >
                {matchLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Sparkles className="h-4 w-4" />}
                {autoMatch ? 'Auto-match on' : 'Auto-match'}
              </button>
            </>
          )}
        />

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <JobFilters filters={filters} onFilterChange={setFilters} domains={domains} locations={locations} />
            </div>
          </div>

          <section>
            <div className="command-surface mb-4 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-secondary-foreground">
                <Search className="h-4 w-4" />
                <span><strong className="text-foreground">{displayJobs.length}</strong> {displayJobs.length === 1 ? 'opportunity' : 'opportunities'} shown</span>
              </div>
              {autoMatch && <span className="status-pill border-blue-200 bg-blue-50 text-blue-700">Sorted by resume fit</span>}
            </div>

            {loading || matchLoading ? (
              <div className="grid gap-4">
                {[...Array(4)].map((_, index) => <SkeletonJobCard key={index} />)}
              </div>
            ) : displayJobs.length > 0 ? (
              <motion.div className="grid gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AnimatePresence mode="popLayout">
                  {displayJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedjobs.includes(job.id)}
                      onSave={handleSave}
                      onApply={(jobId) => navigate(`/jobs/${jobId}`)}
                      matchScore={autoMatch ? job.skill_match_pct : undefined}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <EmptyState
                icon={Search}
                title="No opportunities match this view"
                description="Clear the filters or broaden your search terms to see more roles."
                action={<button type="button" onClick={() => { setFilters({}); setAutoMatch(false); setAutoMatchJobs([]) }} className="btn-secondary">Clear filters</button>}
              />
            )}
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileFilters(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.2 }} className="fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-hidden rounded-t-lg border-t border-card-border bg-white shadow-xl lg:hidden">
              <div className="flex items-center justify-between border-b border-secondary-border px-4 py-3">
                <h3 className="font-bold text-foreground">Filters</h3>
                <button type="button" onClick={() => setShowMobileFilters(false)} className="rounded-lg p-2 text-secondary-foreground hover:bg-secondary hover:text-foreground" aria-label="Close filters">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-4">
                <JobFilters filters={filters} onFilterChange={setFilters} domains={domains} locations={locations} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}
