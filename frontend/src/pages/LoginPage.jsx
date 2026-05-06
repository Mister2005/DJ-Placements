import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Eye,
  EyeOff,
  FileSearch,
  Gauge,
  Layers3,
  Loader2,
  RadioTower,
  Sparkles,
  Target,
} from 'lucide-react'
import { useAuthStore } from '../context/store'
import { authService } from '../services/api'
import { BrandLogo, BrandMark } from '../components/BrandLogo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = isSignup
        ? await authService.signup({ name, email, password })
        : await authService.login({ email, password })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      login(user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'We could not complete that request. Check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="command-surface mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden lg:grid-cols-[1fr_440px]">
        <section className="login-showcase hidden border-r border-secondary-border p-8 lg:flex lg:flex-col">
          <div className="flex items-center justify-between">
            <BrandLogo />
            <div className="flex items-center gap-2 rounded-full border border-secondary-border bg-white/60 px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
              <RadioTower className="h-3.5 w-3.5 text-primary" /> Live placement desk
            </div>
          </div>

          <div className="mt-10 grid flex-1 grid-rows-[auto_1fr_auto] gap-6">
            <div className="grid gap-7 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
              <div>
                <p className="ambient-label">Rolewise OS</p>
                <h1 className="mt-5 max-w-lg text-5xl font-bold leading-[0.96] text-foreground">
                  See every role, deadline, and decision path at once.
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-secondary-foreground">
                  A glass command center for matching jobs, tracking applications, and acting before opportunities close.
                </p>
              </div>

              <PlacementIntelligence />
            </div>

            <PipelineBoard />

            <div className="grid grid-cols-3 gap-3">
              {[
                ['Match score', '92%', Target],
                ['Open deadlines', '4', CalendarClock],
                ['Profile ready', '86%', Gauge],
              ].map(([item, value, Icon]) => (
                <div key={item} className="metric-card p-4">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/60 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold text-secondary-foreground">{item}</p>
                  <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <BrandMark className="mb-5 h-11 w-11" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Rolewise</h1>
            </div>

            <div className="mb-7">
              <p className="ambient-label mb-4">
                <BriefcaseBusiness className="h-3.5 w-3.5" /> Student career command center
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">{isSignup ? 'Create your account' : 'Sign in to Rolewise'}</h2>
              <p className="mt-2 text-sm leading-6 text-secondary-foreground">
                {isSignup ? 'Set up your profile and start building a placement pipeline.' : 'Use your college email to continue to your placement workspace.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isSignup && (
                <div>
                  <label className="field-label" htmlFor="name">Full name</label>
                  <input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} className="field-input" placeholder="Aarav Sharma" required />
                </div>
              )}

              <div>
                <label className="field-label" htmlFor="email">College email</label>
                <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field-input" placeholder="student@college.edu" required />
              </div>

              <div>
                <label className="field-label" htmlFor="password">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="field-input pr-11" placeholder="Enter your password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-secondary-foreground hover:bg-secondary hover:text-foreground" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Signing in' : isSignup ? 'Create account' : 'Sign in'} {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-secondary-foreground">
              {isSignup ? 'Already have an account?' : 'New to Rolewise?'}{' '}
              <button type="button" onClick={() => { setIsSignup(!isSignup); setError('') }} className="font-semibold text-primary hover:text-primary-hover">
                {isSignup ? 'Sign in' : 'Create an account'}
              </button>
            </div>

            <div className="mt-8 rounded-lg border border-secondary-border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground">Demo access</p>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <p>Email: <span className="font-mono text-foreground">student@college.edu</span></p>
                <p>Password: <span className="font-mono text-foreground">password123</span></p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function PlacementIntelligence() {
  const nodes = [
    { label: 'Resume', icon: FileSearch, className: 'left-[7%] top-[18%]' },
    { label: 'Roles', icon: BriefcaseBusiness, className: 'right-[8%] top-[20%]' },
    { label: 'Alerts', icon: Bell, className: 'bottom-[14%] left-[13%]' },
    { label: 'Rounds', icon: Layers3, className: 'bottom-[16%] right-[10%]' },
  ]

  return (
    <div className="placement-orbit min-h-[300px]">
      <div className="orbit-ring orbit-ring-lg" />
      <div className="orbit-ring orbit-ring-md" />
      <div className="orbit-scan" />

      <div className="orbit-core">
        <Sparkles className="h-5 w-5 text-primary" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground">Best fit</p>
        <p className="mt-1 text-4xl font-bold text-foreground">92%</p>
        <p className="mt-2 text-xs text-secondary-foreground">3 priority roles detected</p>
      </div>

      {nodes.map(({ label, icon: Icon, className }) => (
        <div key={label} className={`orbit-node ${className}`}>
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

function PipelineBoard() {
  const stages = [
    { label: 'Applied', count: 8, active: true },
    { label: 'Shortlist', count: 3, active: true },
    { label: 'Interview', count: 2, active: true },
    { label: 'Offer', count: 1, active: false },
  ]

  return (
    <div className="login-board">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-foreground">Application pipeline</p>
          <p className="mt-1 text-xs text-secondary-foreground">From saved role to final decision</p>
        </div>
        <span className="status-pill border-emerald-200 bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> On track
        </span>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {stages.map((stage, index) => (
          <div key={stage.label} className="pipeline-stage">
            <div className={`pipeline-dot ${stage.active ? 'pipeline-dot-active' : ''}`}>{index + 1}</div>
            <p className="mt-3 text-xs font-semibold text-secondary-foreground">{stage.label}</p>
            <p className="mt-1 text-lg font-bold text-foreground">{stage.count}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
        <div className="rounded-lg border border-secondary-border bg-white/60 p-3">
          <p className="text-xs font-semibold text-secondary-foreground">Next deadline</p>
          <p className="mt-1 text-sm font-bold text-foreground">Data Analyst Intern - 22 hours</p>
        </div>
        <div className="flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-bold text-blue-700">
          Act now
        </div>
      </div>
    </div>
  )
}
