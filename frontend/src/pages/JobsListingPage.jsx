import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJobStore } from '../context/store'
import { JobCard, SkeletonJobCard } from '../components/JobCard'
import { JobFilters } from '../components/JobFilters'
import { jobService, resumeService } from '../services/api'

export default function JobsListingPage() {
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(true)
  const [autoMatch, setAutoMatch] = useState(false)
  const [autoMatchJobs, setAutoMatchJobs] = useState([])
  const [matchLoading, setMatchLoading] = useState(false)
  const navigate = useNavigate()
  const { jobs, filteredJobs, setJobs, filterJobs, savedjobs, toggleSaveJob, setSavedJobs } = useJobStore()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const [jobsRes, bookmarksRes] = await Promise.all([
          jobService.getAllJobs(),
          jobService.getBookmarks()
        ])
        setJobs(jobsRes.data.jobs)
        setSavedJobs(bookmarksRes.data.bookmarks.map(b => b.job_id))
      } catch (err) {
        console.error('Failed to fetch jobs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  useEffect(() => {
    if (!autoMatch) {
      filterJobs(filters)
    }
  }, [filters, autoMatch])

  const handleAutoMatchToggle = async () => {
    if (autoMatch) {
      setAutoMatch(false)
      return
    }
    setMatchLoading(true)
    setAutoMatch(true)
    try {
      const res = await resumeService.autoMatchJobs()
      setAutoMatchJobs(res.data.jobs)
    } catch (err) {
      console.error('Failed to auto-match:', err)
      setAutoMatch(false)
    } finally {
      setMatchLoading(false)
    }
  }

  const handleApply = (jobId) => {
    navigate(`/jobs/${jobId}`)
  }

  const handleSave = async (jobId) => {
    try {
      if (savedjobs.includes(jobId)) {
        await jobService.removeBookmark(jobId)
      } else {
        await jobService.bookmarkJob(jobId)
      }
      toggleSaveJob(jobId)
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
    }
  }

  const displayJobs = autoMatch ? autoMatchJobs : filteredJobs
  const domains = ['Software', 'Product', 'Data', 'Finance', 'Core']
  const locations = ['Bangalore', 'Pune', 'Hyderabad', 'Delhi', 'Mumbai']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Explore Job Opportunities</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <JobFilters
              filters={filters}
              onFilterChange={setFilters}
              domains={domains}
              locations={locations}
              autoMatch={autoMatch}
              onAutoMatchToggle={handleAutoMatchToggle}
              autoMatchLoading={matchLoading}
            />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-4 text-sm text-gray-600">
              Showing <span className="font-semibold">{displayJobs.length}</span> job(s)
              {autoMatch && ' — sorted by AI match score'}
            </div>

            {loading || matchLoading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <SkeletonJobCard key={i} />
                ))}
              </div>
            ) : displayJobs.length > 0 ? (
              <div className="grid gap-4">
                {displayJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedjobs.includes(job.id)}
                    onSave={handleSave}
                    onApply={handleApply}
                    matchScore={autoMatch ? job.skill_match_pct : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 font-medium">No jobs found matching your filters</p>
                <button
                  onClick={() => { setFilters({}); setAutoMatch(false) }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
