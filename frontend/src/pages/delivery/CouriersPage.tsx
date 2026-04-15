import { useState } from 'react'
import { Search, CheckCircle, AlertTriangle, Clock, WifiOff } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SectionHeader from '../../components/dashboard/SectionHeader'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { useModal } from '../../hooks/useModal'
import { COURIERS, DELIVERIES, type Courier } from '../../data/deliveryData'
import clsx from 'clsx'

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active:    { label: 'Active',    color: 'bg-emerald-50 text-emerald-700', icon: <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> },
  resting:   { label: 'Resting',   color: 'bg-amber-50 text-amber-700',    icon: <Clock size={11} /> },
  suspended: { label: 'Suspended', color: 'bg-red-50 text-red-600',        icon: <AlertTriangle size={11} /> },
  offline:   { label: 'Offline',   color: 'bg-slate-100 text-slate-500',   icon: <WifiOff size={11} /> },
}

export default function CouriersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState<Courier | null>(null)
  const modal = useModal()

  const filtered = COURIERS.filter(c => {
    const matchStatus = statusFilter === 'All' || c.status === statusFilter
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  function openDetail(c: Courier) { setSelected(c); modal.openModal() }

  const courierDeliveries = selected
    ? DELIVERIES.filter(d => d.courierId === selected.id && ['in_transit','picking','pending'].includes(d.status))
    : []

  const counts = {
    active:    COURIERS.filter(c => c.status === 'active').length,
    resting:   COURIERS.filter(c => c.status === 'resting').length,
    suspended: COURIERS.filter(c => c.status === 'suspended').length,
  }

  return (
    <>
    <DashboardLayout>
      <SectionHeader
        title="Couriers"
        subtitle="Monitor courier availability, performance, and active assignments."
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active',    value: counts.active,    color: 'text-emerald-600' },
          { label: 'Resting',   value: counts.resting,   color: 'text-amber-600' },
          { label: 'Suspended', value: counts.suspended, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white shadow-card px-5 py-4">
            <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
        </div>
        <div className="flex gap-1.5">
          {['All', 'active', 'resting', 'suspended', 'offline'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={clsx('rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all',
                statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              )}>{s === 'All' ? 'All' : s}</button>
          ))}
        </div>
      </div>

      {/* Courier cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const meta = STATUS_META[c.status]
          const onTimeNum = parseFloat(c.onTimeRate)
          return (
            <button key={c.id} onClick={() => openDetail(c)}
              className="rounded-2xl bg-white shadow-card hover:shadow-card-hover p-5 text-left transition-all duration-200 active:scale-[0.99] space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex-shrink-0">
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.vehicle}</p>
                  </div>
                </div>
                <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', meta.color)}>
                  {meta.icon}{meta.label}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 py-2">
                  <p className="text-sm font-bold text-slate-900">{c.activeOrders}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Active</p>
                </div>
                <div className="rounded-xl bg-slate-50 py-2">
                  <p className={clsx('text-sm font-bold', onTimeNum >= 90 ? 'text-emerald-600' : 'text-red-500')}>{c.onTimeRate}</p>
                  <p className="text-xs text-slate-400 mt-0.5">On-Time</p>
                </div>
                <div className="rounded-xl bg-slate-50 py-2">
                  <p className="text-sm font-bold text-amber-500">★ {c.rating}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Rating</p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Batch {c.activeOrders}/{c.batchLimit}</span>
                  <span>{c.completedToday} done today</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100">
                  <div className={clsx('h-1.5 rounded-full transition-all',
                    c.activeOrders === c.batchLimit ? 'bg-red-400' : 'bg-brand-500'
                  )} style={{ width: `${(c.activeOrders / c.batchLimit) * 100}%` }} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </DashboardLayout>

    {/* Courier detail modal */}
    {selected && (
      <Modal
        open={modal.open}
        minimized={modal.minimized}
        title={selected.name}
        subtitle={`${selected.vehicle} · ${STATUS_META[selected.status].label}`}
        onClose={modal.closeModal}
        onMinimize={modal.toggleMinimize}
        footer={<Button variant="secondary" onClick={modal.closeModal}>Close</Button>}
      >
        <div className="space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Email',         value: selected.email },
              { label: 'Phone',         value: selected.phone },
              { label: 'Vehicle',       value: selected.vehicle },
              { label: 'Batch Limit',   value: `${selected.activeOrders}/${selected.batchLimit} orders` },
              { label: 'On-Time Rate',  value: selected.onTimeRate },
              { label: 'Rating',        value: `★ ${selected.rating}` },
              { label: 'Completed Today', value: `${selected.completedToday} deliveries` },
              { label: 'Hours Today',   value: selected.hoursToday },
            ].map(f => (
              <div key={f.label} className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400">{f.label}</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Active deliveries */}
          {courierDeliveries.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Active Assignments</p>
              <div className="space-y-2">
                {courierDeliveries.map(d => (
                  <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-xs font-mono font-semibold text-slate-700">{d.orderId}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{d.address}</p>
                    </div>
                    <div className="text-right">
                      <span className={clsx('text-xs font-semibold',
                        d.status === 'delayed' ? 'text-red-500' :
                        d.status === 'in_transit' ? 'text-sky-600' : 'text-violet-600'
                      )}>
                        {d.status.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">ETA {d.eta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.status === 'suspended' && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" />
              <p className="text-sm text-red-700">Courier suspended due to low on-time rate. Batch limit reduced to {selected.batchLimit}.</p>
            </div>
          )}
        </div>
      </Modal>
    )}
    </>
  )
}
