import React from 'react'

export function JobCard({ job, isSaved, onSave, onApply, matchScore }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-lg font-bold text-gray-900">{job.role}</h3>
          <p className="text-sm text-gray-600">{job.company}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {matchScore !== undefined && matchScore > 0 && (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              matchScore >= 70 ? 'bg-green-100 text-green-700' :
              matchScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {matchScore}% match
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onSave(job.id) }}
            className={`p-2 rounded-lg transition-colors ${
              isSaved ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          📍 {job.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          📅 Last date: {new Date(job.last_date_to_apply).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          💼 {job.job_type}
        </div>
        {job.salary && (
          <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
            💰 {job.salary}
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">Required Skills:</p>
        <div className="flex flex-wrap gap-2">
          {job.skills?.slice(0, 4).map((skill, idx) => (
            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
              {skill}
            </span>
          ))}
          {job.skills?.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onApply(job.id)}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        View Details & Apply
      </button>
    </div>
  )
}

export function SkeletonJobCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-3 mb-4">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  )
}
