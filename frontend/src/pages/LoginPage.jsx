import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, BriefcaseBusiness, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../context/store'
import { authService } from '../services/api'

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
        <section className="hidden border-r border-secondary-border p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">PH</div>
            <p className="ambient-label mt-10">Placement OS</p>
            <h1 className="mt-5 max-w-xl text-5xl font-bold tracking-tight text-foreground">Glass-clear control over every placement decision.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-secondary-foreground">Track applications, compare job fit, manage deadlines, and keep your profile ready inside one sharp command surface.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['Job matching', '92%'],
              ['Deadline radar', '4 open'],
              ['Pipeline', 'Active'],
            ].map(([item, value]) => (
              <div key={item} className="metric-card p-4">
                <p className="text-xs font-semibold text-secondary-foreground">{item}</p>
                <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">PH</div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">PlaceHub</h1>
            </div>

            <div className="mb-7">
              <p className="ambient-label mb-4">
                <BriefcaseBusiness className="h-3.5 w-3.5" /> Student placement platform
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">{isSignup ? 'Create your account' : 'Sign in to PlaceHub'}</h2>
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
              {isSignup ? 'Already have an account?' : 'New to PlaceHub?'}{' '}
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
