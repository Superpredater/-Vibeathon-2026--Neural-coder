import { TrendingUp, TrendingDown, Package, Users, Clock, AlertTriangle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SectionHeader from '../../components/dashboard/SectionHeader'
import StatCard from '../../components/dashboard/StatCard'
import clsx from 'clsx'

// Simulated 7-day order volume data
const DAILY_ORDERS = [
  { day: 'Mon', orders: 820,  sla: 97.1 },
  { day: 'Tue', orders: 940,  sla: 96.8 },
  { day: 'Wed', orders: 1100, sla: 95.4 },
  { day: 'Thu', orders: 1280, sla: 97.6 },
  { day: 'Fri', orders: 1540, sla: 94.2 },
  { day: 'Sat', orders: 1820, sla: 93.8 },
  { day: 'Sun', orders: 1640, sla: 96.1 },
]
const MAX_ORDERS = Math.max(...DAILY_ORDERS.map(d => d.orders))

const TOP_SKUS = [
  { name: 'Amul Milk 500ml',   sold: 842, revenue: '₹ 33,680', trend: '+12%', up: true },
  { name: 'Bread (Brown)',     sold: 620, revenue: '₹ 18,600', trend: '+8%',  up: true },
  { name: 'Eggs (12 pack)',    sold: 510, revenue: '₹ 25,500', trend: '+5%',  up: true },
  { name: 'Curd 400g',         sold: 480, revenue: '₹ 14,400', trend: '-3%',  up: false },
  { name: 'Banana (dozen)',    sold: 390, revenue: '₹ 7,800',  trend: '+2%',  up: true },
]

const STORE_PERF = [
  { store: 'DS-North', orders: 2840, sla: '97.8%', margin: '₹ 1.2L', health: 94 },
  { store: 'DS-South', orders: 2210, sla: '96.1%', margin: '₹ 0.9L', health: 88 },
  { store: 'DS-East',  orders: 1540, sla: '89.4%', margin: '₹ 0.6L', health: 71 },
  { store: 'DS-West',  orders: 3100, sla: '98.2%', margin: '₹ 1.5L', health: 97 },
]

const LOGIN_ACTIVITY = [
  { role: 'Company Admin',   logins: 14, failed: 1 },
  { role: 'Delivery Staff',  logins: 38, failed: 3 },
  { role: 'Courier',         logins: 92, failed: 7 },
  { role: 'Finance Staff',   logins: 21, failed: 0 },
]

export default function AdminAnalyticsPage() {
  return (
    <DashboardLayout>
      <SectionHeader
        title="Analytics"
        subtitle="System-wide performance metrics for the last 7 days."
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders (7d)"   value="9,140"  icon={<Package size={18} className="text-brand-600" />}   iconBg="bg-brand-50"   trend={{ value: '14%', up: true }} />
        <StatCard label="Avg. On-Time Rate"   value="95.8%"  icon={<TrendingUp size={18} className="text-emerald-600" />} iconBg="bg-emerald-50" trend={{ value: '0.6%', up: true }} />
        <StatCard label="Active Users"        value="48"     icon={<Users size={18} className="text-violet-600" />}    iconBg="bg-violet-50"  trend={{ value: '3', up: true }} />
        <StatCard label="Avg. Delivery Time"  value="11.2m"  icon={<Clock size={18} className="text-sky-600" />}       iconBg="bg-sky-50"     trend={{ value: '0.4m', up: false }} />
      </div>

      {/* Order volume bar chart */}
      <div className="mb-8 rounded-2xl bg-white shadow-card p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Daily Order Volume (Last 7 Days)</h2>
        <div className="flex items-end gap-3 h-40">
          {DAILY_ORDERS.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">{d.orders.toLocaleString()}</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-500"
                style={{ height: `${(d.orders / MAX_ORDERS) * 100}%` }}
              />
              <span className="text-xs text-slate-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* SLA trend */}
        <div className="rounded-2xl bg-white shadow-card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-5">SLA Performance (7d)</h2>
          <div className="space-y-3">
            {DAILY_ORDERS.map(d => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="w-8 text-xs text-slate-400">{d.day}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100">
                  <div
                    className={clsx('h-2 rounded-full transition-all duration-500', d.sla >= 96 ? 'bg-emerald-500' : d.sla >= 94 ? 'bg-amber-400' : 'bg-red-400')}
                    style={{ width: `${d.sla}%` }}
                  />
                </div>
                <span className={clsx('text-xs font-semibold w-12 text-right', d.sla >= 96 ? 'text-emerald-600' : d.sla >= 94 ? 'text-amber-600' : 'text-red-500')}>
                  {d.sla}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Login activity */}
        <div className="rounded-2xl bg-white shadow-card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-5">Login Activity (7d)</h2>
          <div className="space-y-3">
            {LOGIN_ACTIVITY.map(l => (
              <div key={l.role} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-700 font-medium">{l.role}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-900">{l.logins} logins</span>
                  {l.failed > 0 && (
                    <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                      <AlertTriangle size={11} /> {l.failed} failed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top SKUs */}
      <div className="mb-8 rounded-2xl bg-white shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Top Selling SKUs (7d)</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['SKU', 'Units Sold', 'Revenue', 'Trend'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {TOP_SKUS.map((s, i) => (
              <tr key={s.name} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-300 w-4">#{i + 1}</span>
                    <span className="font-medium text-slate-900">{s.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-700">{s.sold.toLocaleString()}</td>
                <td className="px-5 py-3.5 font-medium text-slate-800">{s.revenue}</td>
                <td className="px-5 py-3.5">
                  <span className={clsx('flex items-center gap-1 text-xs font-semibold', s.up ? 'text-emerald-600' : 'text-red-500')}>
                    {s.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {s.trend}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dark store performance */}
      <div className="rounded-2xl bg-white shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Dark Store Performance (7d)</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Store', 'Orders', 'SLA Rate', 'Net Margin', 'Stock Health'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {STORE_PERF.map(s => (
              <tr key={s.store} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-slate-900">{s.store}</td>
                <td className="px-5 py-3.5 text-slate-700">{s.orders.toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  <span className={clsx('font-semibold', parseFloat(s.sla) >= 96 ? 'text-emerald-600' : parseFloat(s.sla) >= 94 ? 'text-amber-600' : 'text-red-500')}>
                    {s.sla}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-800">{s.margin}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 max-w-[80px]">
                      <div
                        className={clsx('h-1.5 rounded-full', s.health > 85 ? 'bg-emerald-500' : s.health > 60 ? 'bg-amber-400' : 'bg-red-400')}
                        style={{ width: `${s.health}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{s.health}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
