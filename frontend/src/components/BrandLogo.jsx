import React from 'react'

export function BrandMark({ className = 'h-10 w-10' }) {
  return (
    <div className={`brand-mark ${className}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" role="img">
        <path className="brand-mark-orbit" d="M11 27c4.8-14.6 22.5-17 27.2-7.4 3.4 7-2.8 15.5-12.7 15.5-8.8 0-14.4-5.4-12.2-11.5" />
        <path className="brand-mark-path" d="M16 31 23.6 15 32 31" />
        <path className="brand-mark-path" d="M19.6 25.2h8.8" />
        <circle className="brand-mark-node" cx="12.7" cy="27.6" r="2.2" />
        <circle className="brand-mark-node" cx="36.4" cy="19.2" r="2.2" />
        <circle className="brand-mark-core" cx="24" cy="24" r="3" />
      </svg>
    </div>
  )
}

export function BrandLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark className={compact ? 'h-9 w-9' : 'h-11 w-11'} />
      {!compact && (
        <div>
          <p className="text-sm font-bold leading-none text-foreground">Rolewise</p>
          <p className="mt-0.5 text-[11px] font-medium text-secondary-foreground">Placement OS</p>
        </div>
      )}
    </div>
  )
}
