import { useState } from 'react'
import { Search, RefreshCw, AlertTriangle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SectionHeader from '../../components/dashboard/SectionHeader'
import StatusBadge from '../../components/dashboard/StatusBadge'
import Button from '../../components/ui/Button'
import clsx from 'clsx'

const ALL_ORDERS = [
  { id: 'ORD-001', customer: 'Customer A', store: 'DS-North', items: 4, status: 'in_transit' as const, sla: '6 min',  courier: 'Sam Patel',   value: '₹ 420', created: '14:32' },
  { id: 'ORD-002', customer: 'Customer B', store: 'DS-South', items: 2, status: 'picking'    as const, sla: '11 min', courier: 'Riya Mehta',  value: '₹ 185', created: '14:28' },
  { id: 'ORD-003', customer: 'Customer C', store: 'DS-East',  items: 6, status: 'delivered'  as const, sla: '—',      courier: 'Arjun Das',   value: '₹ 640', created: '13:55' },
  { id: 'ORD-004', customer: 'Customer D', store: 'DS-West',  items: 1, status: 'delayed'    as const, sla: '2 min',  courier: 'Sam Patel',   value: '₹ 95',  created: '14:30' },
  { id: 'ORD-005', customer: 'Customer E', store: 'DS-North', items: 3, status: 'pending'    as const, sla: '—',      courier: 'Unassigned',  value: '₹ 310', created: '14:35' },
  { id: 'ORD-006', customer: 'Customer F', store: 'DS-South', items: 5, status: 'delivered'  as const, sla: '—',      courier: 'Neha Gupta',  value: '₹ 520', created: '13:40' },
  { id: 'ORD-007', customer: 'Customer G', store: 'DS-West',  items: 2, status: 'in_transit' as const, sla: '9 min',  courier: 'Arjun Das',   value: '₹ 230', created: '14:20' },
  { id: 'ORD-008', customer: 'Customer H', store: 'DS-East',  items: 7, status: 'cancelled'  as const, sla: '—',      courier: '—',           value: '₹ 780', created: '13:10' },
]

const STATUS_FILTERS = ['All', 'pending', 'picking', 'in_transit', 'delivered', 'delayed', 'cancelled']

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = ALL_ORDERS.filter(o => {
    const matchStatus = statusFilter === 'All' || o.status === statusFilter
    const matchSearch = !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.store.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    total: ALL_ORDERS.length,
    active: ALL_ORDERS.filter(o => ['in_transit','picking','pending'].includes(o.status)).length,
    delayed: ALL_ORDERS.filter(o => o.status === 'delayed').length,
    delivered: ALL_ORDERS.filter(o => o.status === 'delivered').length,
  }

  return (
    <DashboardLayout>
      <SectionHeader
        title="Orders"
        subtitle="Monitor and manage all orders across the network."
        action={
          <Button variant="secondary">
            <RefreshCw size={14} /> Refresh
          </Button>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Today',  value: counts.total,     color: 'text-slate-900' },
          { label: 'Active',       value: counts.active,    color: 'text-brand-600' },
          { label: 'Delayed',      value: counts.delayed,   color: 'text-red-500' },
          { label: 'Delivered',    value: counts.delivered, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white shadow-card px-5 py-4">
            <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Delayed alert */}
      {counts.delayed > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-3.5 animate-fade-in">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {counts.delayed} order{counts.delayed > 1 ? 's are' : ' is'} at risk of SLA breach — immediate action required.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer, or store…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all duration-150',
                statusFilter === s
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {s === 'All' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Order ID', 'Customer', 'Dark Store', 'Courier', 'Items', 'Value', 'Status', 'SLA', 'Time'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-400">No orders found.</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id} className={clsx('hover:bg-slate-50 transition-colors', o.status === 'delayed' && 'bg-red-50/40')}>
                <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700">{o.id}</td>
                <td className="px-5 py-3.5 font-medium text-slate-900">{o.customer}</td>
                <td className="px-5 py-3.5 text-slate-500">{o.store}</td>
                <td className="px-5 py-3.5 text-slate-500 text-xs">
                  <span className={o.courier === 'Unassigned' ? 'text-amber-600 font-medium' : ''}>{o.courier}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-700">{o.items}</td>
                <td className="px-5 py-3.5 font-medium text-slate-800">{o.value}</td>
                <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                <td className="px-5 py-3.5">
                  <span className={clsx('text-xs font-semibold', o.status === 'delayed' ? 'text-red-500' : 'text-slate-500')}>
                    {o.sla}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{o.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
