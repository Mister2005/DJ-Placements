import React from 'react'
import { AlertCircle, Loader2, X } from 'lucide-react'

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="command-surface mb-8 flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="ambient-label mb-4">{eyebrow}</p>}
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">{title}</h1>
        {description && <p className="mt-2 text-base leading-7 text-secondary-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}

export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="page-shell flex items-center justify-center">
      <div className="section-card flex min-w-[240px] items-center gap-3 px-5 py-4 text-sm font-medium text-secondary-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        {label}
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon = AlertCircle, title, description, action }) {
  return (
    <div className="section-card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-secondary-border bg-secondary text-secondary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-secondary-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-card-border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-secondary-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-secondary-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5 text-sm leading-6 text-slate-700">{children}</div>
        <div className="flex justify-end gap-3 border-t border-secondary-border bg-slate-50 px-5 py-4">
          <Button variant="secondary" onClick={onClose}>{cancelText}</Button>
          <Button onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  )
}

export function Button({ children, variant = 'primary', size = 'md', loading = false, className = '', ...props }) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover border border-primary',
    secondary: 'bg-white text-foreground hover:bg-secondary border border-secondary-border',
    danger: 'bg-white text-red-700 hover:bg-red-50 border border-red-200',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base'
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold shadow-sm transition duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

export function Badge({ children, variant = 'blue' }) {
  const variants = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    yellow: 'border-amber-200 bg-amber-50 text-amber-700',
    purple: 'border-violet-200 bg-violet-50 text-violet-700',
    gray: 'border-slate-200 bg-slate-50 text-slate-700'
  }

  return (
    <span className={`status-pill ${variants[variant] || variants.gray}`}>
      {children}
    </span>
  )
}
