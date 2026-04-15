import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Zap, ArrowLeft } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import AuthCard from '../components/ui/AuthCard'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return }
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000)) // TODO: real API
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900">AQCLI Platform</span>
        </div>

        {sent ? (
          <AuthCard>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
                <Mail size={24} className="text-brand-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Check your inbox</h2>
                <p className="text-sm text-slate-500 mt-2">
                  We sent a password reset link to <strong>{email}</strong>. It expires in 1 hour.
                </p>
              </div>
              <Link to="/login" className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
                Back to Sign in
              </Link>
            </div>
          </AuthCard>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Forgot your password?</h2>
              <p className="text-slate-500 text-sm mt-1">Enter your email and we'll send you a reset link.</p>
            </div>
            <AuthCard>
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@company.com"
                  icon={<Mail size={15} />}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  error={error}
                />
                <Button type="submit" fullWidth loading={loading}>
                  Send reset link
                </Button>
              </form>
            </AuthCard>
            <Link to="/login" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft size={14} /> Back to Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
