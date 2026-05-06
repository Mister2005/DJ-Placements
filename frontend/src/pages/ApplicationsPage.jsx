import React, { useState, useEffect } from 'react'
import { ApplicationStatusBadge } from '../components/FeatureComponents'
import { applicationService } from '../services/api'

export default function ApplicationsPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await applicationService.getApplications()
        setApplications(res.data.applications)
      } catch (err) {
        console.error('Failed to fetch applications:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  const filteredApplications = applications.filter(app => {
    if (selectedTab === 'all') return true
    return app.status === selectedTab
  })

  const tabCounts = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview_scheduled: applications.filter(a => a.status === 'interview_scheduled').length,
    selected: applications.filter(a => a.status === 'selected').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading applications...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Applications</h1>

        <div className="bg-white rounded-lg shadow-md mb-6 flex overflow-x-auto">
          {['all', 'applied', 'shortlisted', 'interview_scheduled', 'selected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                selectedTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')} ({tabCounts[tab]})
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{app.role}</h3>
                    <p className="text-gray-600">{app.company}</p>
                    <p className="text-xs text-gray-500 mt-1">Applied on {new Date(app.applied_date).toLocaleDateString()}</p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>

                {app.timeline && (
                  <div className="relative mb-6">
                    <div className="space-y-4">
                      {app.timeline.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              item.completed ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {item.completed ? '✓' : idx + 1}
                            </div>
                            {idx < app.timeline.length - 1 && (
                              <div className={`w-0.5 h-12 ${item.completed ? 'bg-green-200' : 'bg-gray-200'}`}></div>
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="font-semibold text-gray-900">{item.stage}</p>
                            {item.date && (
                              <p className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 font-medium">No applications in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
