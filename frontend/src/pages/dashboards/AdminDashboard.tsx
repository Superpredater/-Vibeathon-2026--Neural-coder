import { Package, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import SectionHeader from '../../components/dashboard/SectionHeader'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

const QUICK_LINKS = [
  { label: 'Manage Users',    sub: 'View, invite, and manage all platform users', to: '/admin/users',     color: 'from-violet-500 to-brand-600' },
  { label: 'View Orders',     sub: 'Monitor live and historical orders',           to: '/admin/orders',    color: 'from-sky-500 to-blue-600' },
  { label: 'Analytics',       sub: 'System-wide performance and SKU insights',     to: '/admin/analytics', color: 'from-emerald-500 to-teal-600' },
  { label: 'Ops Dashboard',   sub: 'Dark store health and manual overrides',       to: '/ops',             color: 'from-amber-500 to-orange-500' },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { stats } = useData()

  const activeOrders = stats?.active_orders ?? '—'
  const totalUsers   = stats?.total_users   ?? '—'
  const delayed      = stats?.delayed_orders ?? '—'

  return (
    <DashboardLayout>
      <SectionHeader
        title={`Welcome back, ${user?.name || 'Admin'}`}
        subtitle="Here's a snapshot of your network right now."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Active Orders"  value={activeOrders} icon={<Package size={18} className="text-brand-600" />}   iconBg="bg-brand-50" />
        <StatCard label="Total Users"    value={totalUsers}   icon={<Users size={18} className="text-violet-600" />}    iconBg="bg-violet-50" />
        <StatCard label="On-Time Rate"   value="97.2%" icon={<TrendingUp size={18} className="text-emerald-600" />} iconBg="bg-emerald-50" />
        <StatCard label="SLA Breaches"   value={delayed}     icon={<AlertTriangle size={18} className="text-red-500" />}  iconBg="bg-red-50" />
      </div>

      {/* Quick navigation cards */}
      <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUICK_LINKS.map(link => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            className="group flex items-center gap-4 rounded-2xl bg-white shadow-card hover:shadow-card-hover p-5 text-left transition-all duration-200 active:scale-[0.99]"
          >
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${link.color}`}>
              <span className="text-white text-lg font-bold">{link.label[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">{link.label}</p>
              <p className="text-sm text-slate-500 mt-0.5 truncate">{link.sub}</p>
            </div>
            <span className="text-slate-300 group-hover:text-brand-500 transition-colors">→</span>
          </button>
        ))}
      </div>
    </DashboardLayout>
  )
}
