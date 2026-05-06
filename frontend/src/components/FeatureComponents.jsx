import React from 'react'

export function SkillMatcher({ matchPercentage, matchedSkills, missingSkills }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h4 className="font-bold text-lg text-gray-900 mb-4">Skill Match</h4>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Your Match</span>
          <span className={`text-2xl font-bold ${matchPercentage >= 70 ? 'text-green-600' : matchPercentage >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>{matchPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${matchPercentage >= 70 ? 'bg-green-500' : matchPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${matchPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-semibold text-green-700 mb-3">
            ✓ You Have ({matchedSkills?.length || 0})
          </h5>
          <div className="space-y-1.5">
            {matchedSkills?.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                <span className="text-green-600 font-bold">✓</span>
                {skill}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-red-700 mb-3">
            ✗ You Need ({missingSkills?.length || 0})
          </h5>
          <div className="space-y-1.5">
            {missingSkills?.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                <span className="text-red-600 font-bold">✗</span>
                {skill}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DeadlineCard({ job, daysRemaining }) {
  const urgency = daysRemaining <= 3 ? 'urgent' : daysRemaining <= 7 ? 'warning' : 'normal'
  const colors = {
    urgent: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    normal: 'bg-green-50 border-green-200 text-green-700'
  }

  return (
    <div className={`${colors[urgency]} border rounded-lg p-4`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-gray-900">{job.role}</h4>
          <p className="text-sm text-gray-600">{job.company}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          urgency === 'urgent' ? 'bg-red-200 text-red-700' :
          urgency === 'warning' ? 'bg-yellow-200 text-yellow-700' :
          'bg-green-200 text-green-700'
        }`}>
          {daysRemaining} days left
        </span>
      </div>
      <p className="text-xs text-gray-600 mt-2">
        {new Date(job.last_date_to_apply).toLocaleDateString()}
      </p>
    </div>
  )
}

export function ApplicationStatusBadge({ status }) {
  const statusColors = {
    applied: 'bg-blue-100 text-blue-700',
    shortlisted: 'bg-purple-100 text-purple-700',
    interview_scheduled: 'bg-cyan-100 text-cyan-700',
    selected: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  }

  const statusLabels = {
    applied: 'Applied',
    shortlisted: 'Shortlisted',
    interview_scheduled: 'Interview Scheduled',
    selected: 'Selected',
    rejected: 'Rejected'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  )
}
