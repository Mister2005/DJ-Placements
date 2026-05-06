import React, { useEffect, useState } from 'react'
import { Briefcase, Calendar, Check } from 'lucide-react'
import { ApplicationStatusBadge } from '../components/FeatureComponents'
import { EmptyState, LoadingState, PageHeader } from '../components/Common'
import { applicationService } from '../services/api'

export default function ApplicationsPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await applicationService.getApplications()
        setApplications(res.data.applications || [])
      } catch (err) {
        console.error('Failed to fetch applications:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [])

  if (loading) return <LoadingState label="Loading applications" />

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'applied', label: 'Applied' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'interview_scheduled', label: 'Interview' },
    { id: 'selected', label: 'Selected' }
  ]

  const tabCounts = tabs.reduce((acc, tab) => {
    acc[tab.id] = tab.id === 'all' ? applications.length : applications.filter((app) => app.status === tab.id).length
    return acc
  }, {})

  const filteredApplications = applications.filter((app) => selectedTab === 'all' || app.status === selectedTab)

  return (
    <main className="page-shell">
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader
          eyebrow="Pipeline"
          title="Applications"
          description="Follow each role from submission through selection without losing context."
        />

        <div className="mb-6 overflow-x-auto rounded-lg border border-card-border bg-white p-1 shadow-sm">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id)}
                className={`rounded-md px-4 py-2.5 text-sm font-semibold transition ${selectedTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-secondary-foreground hover:bg-secondary hover:text-foreground'}`}
              >
                {tab.label} <span className="ml-1 opacity-80">{tabCounts[tab.id]}</span>
              </button>
            ))}
          </div>
        </div>

        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <article key={app.id} className="section-card p-5 transition hover:border-primary/35 hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-foreground">{app.role}</h2>
                    <p className="mt-1 text-sm font-medium text-secondary-foreground">{app.company}</p>
                    <p className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      Applied {new Date(app.applied_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>

                {app.timeline?.length > 0 && (
                  <div className="mt-6 border-t border-secondary-border pt-5">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {app.timeline.map((item, index) => (
                        <div key={`${item.stage}-${index}`} className={`rounded-lg border p-3 ${item.completed ? 'border-emerald-200 bg-emerald-50' : 'border-secondary-border bg-slate-50'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${item.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                              {item.completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                            </span>
                            <p className="text-sm font-semibold text-foreground">{item.stage}</p>
                          </div>
                          {item.date && <p className="mt-2 text-xs text-secondary-foreground">{new Date(item.date).toLocaleDateString()}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon={Briefcase} title="No applications here" description="Applications in this status will appear here as your pipeline changes." />
        )}
      </div>
    </main>
  )
}
