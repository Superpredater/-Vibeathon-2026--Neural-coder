import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Zap, ChevronRight } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import AuthCard from '../components/ui/AuthCard'
import { useAuth } from '../context/AuthContext'
import { ROLE_ROUTES } from '../hooks/useRoleRedirect'
import { DEMO_USERS, findDemoUser, makeFakeJwt } from '../data/demoUsers'
import clsx from 'clsx'

interface FormState { email: string; password: string; remember: boolean }
interface Errors { email?: string; password?: string; general?: string }

function validate(form: FormState): Errors {
  const errors: Errors = {}
  if (!form.email) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Enter a valid email address'
  if (!form.password) errors.password = 'Password is required'
  else if (form.password.length < 8)
    errors.password = 'Password must be at least 8 characters'
  return errors
}

const ROLE_COLORS: Record<string, string> = {
  company_admin:  'bg-violet-50 text-violet-700 border-violet-100',
  delivery_staff: 'bg-sky-50 text-sky-700 border-sky-100',
  courier:        'bg-emerald-50 text-emerald-700 border-emerald-100',
  finance_staff:  'bg-amber-50 text-amber-700 border-amber-100',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuth()
  const [form, setForm] = useState<FormState>({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  if (isAuthenticated && user) {
    navigate(ROLE_ROUTES[user.role], { replace: true })
    return null
  }

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: key === 'remember' ? e.target.checked : e.target.value }))

  function fillDemo(email: string, password: string) {
    setForm(f => ({ ...f, email, password }))
    setErrors({})
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    const demoUser = findDemoUser(form.email, form.password)
    if (!demoUser) {
      setErrors({ general: 'Invalid email or password. Try a demo account below.' })
      setLoading(false)
      return
    }
    login(makeFakeJwt(demoUser))
    navigate(ROLE_ROUTES[demoUser.role], { replace: true })
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">AQCLI Platform</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight">
              Power your<br />dark store network
            </h1>
            <p className="text-brand-200 text-lg leading-relaxed max-w-sm">
              The B2B operational backbone for micro-fulfillment centers and 10-minute delivery networks.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {[
              { label: 'Orders / min', value: '10,000+' },
              { label: 'Delivery SLA', value: '< 15 min' },
              { label: 'Dark stores', value: 'Multi-tenant' },
              { label: 'Uptime', value: '99.9%' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl bg-white/10 p-4">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-sm text-brand-200 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-brand-300">© {new Date().getFullYear()} AQCLI. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900">AQCLI Platform</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {/* Demo accounts panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Demo accounts — click to fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map(u => (
                <button
                  key={u.role}
                  type="button"
                  onClick={() => fillDemo(u.email, u.password)}
                  className={clsx(
                    'flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all duration-150',
                    'hover:shadow-sm active:scale-[0.98]',
                    ROLE_COLORS[u.role]
                  )}
                >
                  <div>
                    <p className="text-xs font-semibold">{u.label}</p>
                    <p className="text-xs opacity-70 mt-0.5 truncate max-w-[110px]">{u.email}</p>
                  </div>
                  <ChevronRight size={13} className="opacity-50 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <AuthCard>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {errors.general && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 animate-fade-in">
                  {errors.general}
                </div>
              )}

              <Input
                label="Email address"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                icon={<Mail size={15} />}
                value={form.email}
                onChange={set('email')}
                error={errors.email}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                icon={<Lock size={15} />}
                value={form.password}
                onChange={set('password')}
                error={errors.password}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={set('remember')}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" fullWidth loading={loading}>
                Sign in
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-400">or</span>
                </div>
              </div>

              <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/register')}>
                Create an account
              </Button>
            </form>
          </AuthCard>

          <p className="text-center text-xs text-slate-400">
            By signing in you agree to our{' '}
            <a href="#" className="underline hover:text-slate-600">Terms</a> and{' '}
            <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
