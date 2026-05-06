import React from 'react'
import { Briefcase, FilterX, MapPin, Search } from 'lucide-react'

export function JobFilters({ filters, onFilterChange, domains, locations }) {
  const hasFilters = filters.search || filters.domain || filters.location || filters.jobType

  return (
    <aside className="command-surface p-5">
      <div className="mb-5 flex items-center justify-between border-b border-secondary-border pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Refine jobs</h3>
          <p className="mt-1 text-xs text-secondary-foreground">Narrow by role, domain, and location.</p>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => onFilterChange({})}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-secondary-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <FilterX className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <label className="field-label" htmlFor="job-search">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="job-search"
              type="text"
              placeholder="Company, role, or skill"
              value={filters.search || ''}
              onChange={(event) => onFilterChange({ ...filters, search: event.target.value })}
              className="field-input pl-9"
            />
          </div>
        </div>

        <SelectField
          id="domain"
          label="Domain"
          icon={Briefcase}
          value={filters.domain || ''}
          onChange={(value) => onFilterChange({ ...filters, domain: value })}
          options={domains}
          emptyLabel="All domains"
        />

        <SelectField
          id="location"
          label="Location"
          icon={MapPin}
          value={filters.location || ''}
          onChange={(value) => onFilterChange({ ...filters, location: value })}
          options={locations}
          emptyLabel="All locations"
        />

        <div>
          <p className="field-label">Job type</p>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-secondary-border bg-white/50 p-1">
            {['Full-time', 'Internship'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onFilterChange({ ...filters, jobType: filters.jobType === type ? '' : type })}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${filters.jobType === type ? 'bg-white text-primary shadow-sm' : 'text-secondary-foreground hover:text-foreground'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

function SelectField({ id, label, icon: Icon, value, onChange, options, emptyLabel }) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field-input appearance-none pl-9"
        >
          <option value="">{emptyLabel}</option>
          {options?.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
