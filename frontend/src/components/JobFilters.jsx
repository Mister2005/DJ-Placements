import React from 'react'

export function JobFilters({ filters, onFilterChange, domains, locations, autoMatch, onAutoMatchToggle, autoMatchLoading }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="font-bold text-lg text-gray-900">Filters</h3>

      {/* AI Auto Match Toggle */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoMatch}
            onChange={onAutoMatchToggle}
            disabled={autoMatchLoading}
            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
          />
          <div>
            <span className="text-sm font-semibold text-purple-900 flex items-center gap-1">
              🤖 AI Auto Match
              {autoMatchLoading && <span className="animate-spin text-xs">⚙️</span>}
            </span>
            <p className="text-xs text-purple-600 mt-0.5">Rank jobs by profile match</p>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <input
          type="text"
          placeholder="Company, Role, or Skill"
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
        <select
          value={filters.domain || ''}
          onChange={(e) => onFilterChange({ ...filters, domain: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Domains</option>
          {domains?.map((domain) => (
            <option key={domain} value={domain}>{domain}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <select
          value={filters.location || ''}
          onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Locations</option>
          {locations?.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
        <select
          value={filters.jobType || ''}
          onChange={(e) => onFilterChange({ ...filters, jobType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      <button
        onClick={() => onFilterChange({})}
        className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
      >
        Clear Filters
      </button>
    </div>
  )
}
