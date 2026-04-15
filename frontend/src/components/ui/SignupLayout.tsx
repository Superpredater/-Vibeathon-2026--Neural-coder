import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'
import clsx from 'clsx'

interface SignupLayoutProps {
  title: string
  subtitle: string
  iconBg: string
  icon: ReactNode
  children: ReactNode
  success?: boolean
}

export default function SignupLayout({
  title, subtitle, iconBg, icon, children, success
}: SignupLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 max-w-xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900">AQCLI Platform</span>
        </div>
        <Link
          to="/register"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={14} /> All roles
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6 animate-slide-up">
          {/* Role badge */}
          <div className="flex items-center gap-3">
            <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', iconBg)}>
              {icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>

          {success ? (
            <div className="rounded-2xl bg-white shadow-card p-8 text-center space-y-4 animate-slide-up">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Account created!</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Your account is ready. Sign in to get started.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Go to Sign in
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl bg-white shadow-card p-8">
              {children}
            </div>
          )}

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
