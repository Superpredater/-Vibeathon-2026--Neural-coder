import { TrendingUp, Star, Clock, CheckCircle, AlertTriangle, Package } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SectionHeader from '../../components/dashboard/SectionHeader'
import LineChart from '../../components/dashboard/LineChart'
import clsx from 'clsx'

const WEEKLY_DELIVERIES = [
  { label: 'Mon', value: 8 },
  { label: 'Tue', value: 11 },
  { label: 'Wed', value: 9 },
  { label: 'Thu', value: 14 },
  { label: 'Fri', value: 16 },
  { label: 'Sat', value: 19 },
  { label: 'Sun', value: 11 },
]

const WEEKLY_ONTIME = [
  { label: 'Mon', value: 87.5 },
  { label: 'Tue', value: 90.9 },
  { label: 'Wed', value: 88.9 },
  { label: 'Thu', value: 92.9 },
  { label: 'Fri', value: 93.8 },
  { label: 'Sat', value: 94.7 },
  { label: 'Sun', value: 90.9 },
]

const HISTORY = [
  { id: 'ORD-091', address: '12 MG Road',       time: '10:32', duration: '9 min',  status: 'delivered'   as const },
  { id: 'ORD-092', address: '45 Park St',        time: '11:14', duration: '11 min', status: 'delivered'   as const },
  { id: 'ORD-093', address: '7 Brigade Rd',      time: '12:05', duration: '—',      status: 'undelivered' as const },
  { id: 'ORD-094', address: '88 Koramangala',    time: '13:22', duration: '8 min',  status: 'delivered'   as const },
  { id: 'ORD-095', address: '22 Indiranagar',    time: '14:01', duration: '13 min', status: 'delivered'   as const },
  { id: 'ORD-096', address: '5 Whitefield',      time: '14:48', duration: '—',      status: 'undelivered' as const },
]

const STATUS_STYLE: Record<string, string> = {
  delivered:   'bg-emerald-50 text-emerald-700',
  undelivered: 'bg-red-50 text-red-600',
}

export default function PerformancePage() {
  const totalDeliveries = WEEKLY_DELIVERIES.reduce((s, d) => s + d.value, 0)
  const avgOnTime = (WEEKLY_ONTIME.reduce((s, d) => s + d.value, 0) / WEEKLY_ONTIME.length).toFixed(1)
  const delivered   = HISTORY.filter(h => h.status === 'delivered').length
  const undelivered = HISTORY.filter(h => h.status === 'undelivered').length

  return (
    <DashboardLayout>
      <SectionHeader title="My Performance" subtitle="Your delivery stats for the last 7 days." />

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Deliveries', value: totalDeliveries, icon: <Package size={18} className="text-brand-600" />,   bg: 'bg-brand-50' },
          { label: 'On-Time Rate',     value: `${avgOnTime}%`, icon: <Clock size={18} className="text-sky-600" />,       bg: 'bg-sky-50' },
          { label: 'Rating',           value: '4.8 / 5',       icon: <Star size={18} className="text-amber-500" />,      bg: 'bg-amber-50' },
          { label: 'Undelivered',      value: undelivered,     icon: <AlertTriangle size={18} className="text-red-500" />, bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white shadow-card p-5 flex flex-col gap-3">
            <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', s.bg)}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl bg-white shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Deliveries per Day</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 7 days</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-brand-600">
              <span className="inline-block h-2 w-6 rounded-full bg-brand-500" /> Deliveries
            </span>
          </div>
          <LineChart
            data={WEEKLY_DELIVERIES}
            color="#6366f1"
            gradientFrom="rgba(99,102,241,0.14)"
            gradientTo="rgba(99,102,241,0)"
            height={200}
            formatValue={v => `${v} deliveries`}
          />
        </div>

        <div className="rounded-2xl bg-white shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">On-Time Rate</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 7 days %</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <span className="inline-block h-2 w-6 rounded-full bg-emerald-500" /> On-Time %
            </span>
          </div>
          <LineChart
            data={WEEKLY_ONTIME}
            color="#10b981"
            gradientFrom="rgba(16,185,129,0.12)"
            gradientTo="rgba(16,185,129,0)"
            height={200}
            formatValue={v => `${v.toFixed(1)}%`}
          />
        </div>
      </div>

      {/* Delivery history */}
      <h2 className="text-base font-semibold text-slate-900 mb-4">Recent Delivery History</h2>
      <div className="rounded-2xl bg-white shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Order ID', 'Address', 'Time', 'Duration', 'Result'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {HISTORY.map(h => (
              <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700">{h.id}</td>
                <td className="px-5 py-3.5 text-slate-700">{h.address}</td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{h.time}</td>
                <td className="px-5 py-3.5 text-slate-600">{h.duration}</td>
                <td className="px-5 py-3.5">
                  <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[h.status])}>
                    {h.status === 'delivered' ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                    {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}