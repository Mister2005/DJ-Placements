import React, { useState, useEffect } from 'react'
import { DeadlineCard } from '../components/FeatureComponents'
import { jobService } from '../services/api'

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const res = await jobService.getJobDeadlines()
        setDeadlines(res.data.deadlines)
      } catch (err) {
        console.error('Failed to fetch deadlines:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDeadlines()
  }, [])

  const sortedDeadlines = [...deadlines].sort((a, b) => a.days_remaining - b.days_remaining)
  const urgentCount = sortedDeadlines.filter(d => d.days_remaining <= 3).length
  const warningCount = sortedDeadlines.filter(d => d.days_remaining > 3 && d.days_remaining <= 7).length
  const normalCount = sortedDeadlines.filter(d => d.days_remaining > 7).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading deadlines...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Application Deadlines</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-semibold text-2xl">{urgentCount}</p>
            <p className="text-red-700 text-sm">Urgent (≤3 days)</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-600 font-semibold text-2xl">{warningCount}</p>
            <p className="text-yellow-700 text-sm">Due Soon (4-7 days)</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 font-semibold text-2xl">{normalCount}</p>
            <p className="text-green-700 text-sm">Coming Up (&gt;7 days)</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Deadlines (Sorted by Urgency)</h2>
          {sortedDeadlines.length > 0 ? sortedDeadlines.map((deadline) => (
            <DeadlineCard key={deadline.id} job={deadline} daysRemaining={deadline.days_remaining} />
          )) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 font-medium">No upcoming deadlines</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📌 Pro Tips</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex gap-2"><span>✓</span><span>Apply at least 2-3 days before the deadline to avoid last-minute issues</span></li>
            <li className="flex gap-2"><span>✓</span><span>Prepare your resume and cover letter in advance</span></li>
            <li className="flex gap-2"><span>✓</span><span>Review the job description and eligibility criteria carefully before applying</span></li>
            <li className="flex gap-2"><span>✓</span><span>Enable notifications to never miss an important deadline</span></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
