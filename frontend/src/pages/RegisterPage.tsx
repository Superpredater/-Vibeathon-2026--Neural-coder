import { useNavigate, Link } from 'react-router-dom'
import { Building2, Truck, User, DollarSign, ArrowRight, Zap } from 'lucide-react'
import clsx from 'clsx'

const roles = [
  {
    id: 'company',
    route: '/register/company',
    icon: Building2,
    title: 'Company',
    subtitle: 'Admin',
    description: 'Manage your entire dark store network, users, and system-wide operations.',
    color: 'from-violet-500 to-brand-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100 hover:border-violet-300',
    iconBg: 'bg-gradient-to-br from-violet-500 to-brand-600',
  },
  {
    id: 'delivery-staff',
    route: '/register/delivery-staff',
    icon: Truck,
    title: 'Delivery Department',
    subtitle: 'Staff',
    description: 'Assign deliveries, track order status, and manage courier operations.',
    color: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    border: 'border-sky-100 hover:border-sky-300',
    iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
  },
  {
    id: 'courier',
    route: '/register/courier',
    icon: User,
    title: 'Delivery Personnel',
    subtitle: 'Courier',
    description: 'View your assigned deliveries, update status, and track your performance.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100 hover:border-emerald-300',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  {
    id: 'finance',
    route: '/register/finance',
    icon: DollarSign,
    title: 'Financial Department',
    subtitle: 'Finance Staff',
    description: 'Handle payments, invoices, transaction logs, and unit economics reporting.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100 hover:border-amber-300',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
  },
]

export default function RegisterPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900">AQCLI Platform</span>
        </div>
        <Link
          to="/login"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          Already have an account? Sign in →
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl space-y-10 animate-slide-up">
          {/* Hero text */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-100 px-4 py-1.5 text-xs font-medium text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Create your account
            </div>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Choose your role to get started
            </h1>
            <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
              Select the role that best describes your position. Each role has a tailored onboarding experience.
            </p>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map(role => {
              const Icon = role.icon
              return (
                <button
                  key={role.id}
                  onClick={() => navigate(role.route)}
                  className={clsx(
                    'group relative flex flex-col gap-4 rounded-2xl border bg-white p-6 text-left',
                    'shadow-card hover:shadow-card-hover transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
                    role.border
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl', role.iconBg)}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all duration-150"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-semibold text-slate-900">{role.title}</h3>
                      <span className="text-xs font-medium text-slate-400">{role.subtitle}</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{role.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-center text-xs text-slate-400">
            By creating an account you agree to our{' '}
            <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and{' '}
            <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
          </p>
        </div>
      </main>
    </div>
  )
}
