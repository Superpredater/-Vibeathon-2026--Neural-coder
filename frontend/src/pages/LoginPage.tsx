import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Zap } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import AuthCard from '../components/ui/AuthCard'

interface FormState {
  email: string
  password: string
  remember: boolean
}

interface Errors {
  email?: string
  password?: string
  general?: string
}

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

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: key === 'remember' ? e.target.checked : e.target.value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      // TODO: replace with real API call
      await new Promise(r => setTimeout(r, 1200))
      // On success, decode JWT role and redirect — placeholder goes to /admin
      navigate('/admin')
    } catch {
      setErrors({ general: 'Invalid email or password. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
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

        <p className="text-sm text-brand-300">
          © {new Date().getFullYear()} AQCLI. All rights reserved.
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900">AQCLI Platform</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
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

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate('/register')}
              >
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
