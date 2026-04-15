import { useState } from 'react'
import { Search, CheckCircle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SectionHeader from '../../components/dashboard/SectionHeader'
import StatusBadge from '../../components/dashboard/StatusBadge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useModal } from '../../hooks/useModal'
import { DELIVERIES, COURIERS, type Delivery } from '../../data/deliveryData'
import clsx from 'clsx'

const STATUS_FILTERS = ['All', 'pending', 'picking', 'in_transit', 'delivered', 'delayed', 'cancelled']

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState(DELIVERIES)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState<Delivery | null>(null)
  const [assignCourierId, setAssignCourierId] = useState('')
  const [assignDone, setAssignDone] = useState(false)
  const modal = useModal()

  const filtered = deliveries.filter(d => {
    const matchStatus = statusFilter === 'All' || d.status === statusFilter
    const matchSearch = !search ||
      d.orderId.toLowerCase().includes(search.toLowerCase()) ||
      d.customer.toLowerCase().includes(search.toLowerCase()) ||
      d.address.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  function openAssign(delivery: Delivery) {
    setSelected(delivery)
    setAssignCourierId('')
    setAssignDone(false)
    modal.openModal()
  }

  function handleAssign() {
    if (!assignCourierId || !selected) return
    setDeliveries(prev => prev.map(d =>
      d.id === selected.id ? { ...d, courierId: assignCourierId, status: 'picking' as const } : d
    ))
    setAssignDone(true)
    setTimeout(() => { modal.closeModal(); setAssignDone(false) }, 1600)
  }

  const availableCouriers = COURIERS.filter(c => c.status === 'active' && c.activeOrders < c.batchLimit)
  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500'

  const counts = {
    active:  deliveries.filter(d => ['in_transit','picking','pending'].includes(d.status)).length,
    delayed: deliveries.filter(d => d.status === 'delayed').length,
    unassigned: deliveries.filter(d => !d.courierId && d.status === 'pending').length,
  }

  return (
    <>
    <DashboardLayout>
      <SectionHeader
        title="Deliveries"
        subtitle="Track and manage all active delivery orders."
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active',     value: counts.active,     color: 'text-brand-600' },
          { label: 'Unassigned', value: counts.unassigned, color: 'text-amber-600' },
          { label: 'Delayed',    value: counts.delayed,    color: 'text-red-500' },
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
          <input type="text" placeholder="Search by order ID, customer, address…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={clsx('rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all',
                statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              )}>
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
              {['Order ID', 'Customer', 'Address', 'Store', 'Items', 'Courier', 'Status', 'ETA', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(d => {
              const courier = COURIERS.find(c => c.id === d.courierId)
              return (
                <tr key={d.id} className={clsx('hover:bg-slate-50 transition-colors', d.status === 'delayed' && 'bg-red-50/30')}>
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700">{d.orderId}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{d.customer}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[160px] truncate">{d.address}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{d.store}</td>
                  <td className="px-5 py-3.5 text-slate-700">{d.items}</td>
                  <td className="px-5 py-3.5">
                    {courier
                      ? <span className="text-slate-700">{courier.name}</span>
                      : <span className="text-amber-600 font-medium text-xs">Unassigned</span>}
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                  <td className="px-5 py-3.5">
                    <span className={clsx('text-xs font-semibold', d.status === 'delayed' ? 'text-red-500' : 'text-slate-500')}>{d.eta}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {!d.courierId && d.status === 'pending' && (
                      <Button variant="primary" className="text-xs py-1 px-3" onClick={() => openAssign(d)}>
                        Assign
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DashboardLayout>

    {/* Assign Courier Modal */}
    {selected && (
      <Modal
        open={modal.open}
        minimized={modal.minimized}
        title="Assign Courier"
        subtitle={`${selected.orderId} · ${selected.customer} · ${selected.store}`}
        onClose={() => { modal.closeModal(); setAssignDone(false) }}
        onMinimize={modal.toggleMinimize}
        footer={
          assignDone ? null : (
            <>
              <Button variant="secondary" onClick={modal.closeModal}>Cancel</Button>
              <Button variant="primary" onClick={handleAssign} disabled={!assignCourierId}>
                Confirm Assignment
              </Button>
            </>
          )
        }
      >
        {assignDone ? (
          <div className="flex flex-col items-center gap-3 py-4 animate-fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-900">Courier assigned!</p>
            <p className="text-sm text-slate-500">Order is now in picking status.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Order</span><span className="font-medium">{selected.orderId}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Address</span><span className="font-medium text-xs">{selected.address}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Items</span><span className="font-medium">{selected.items}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Value</span><span className="font-medium">{selected.value}</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Courier <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {availableCouriers.map(c => (
                  <button key={c.id} onClick={() => setAssignCourierId(c.id)}
                    className={clsx(
                      'w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-150',
                      assignCourierId === c.id
                        ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-400'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.vehicle} · {c.activeOrders}/{c.batchLimit} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-emerald-600">{c.onTimeRate}</p>
                      <p className="text-xs text-slate-400">★ {c.rating}</p>
                    </div>
                  </button>
                ))}
                {availableCouriers.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No available couriers right now.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    )}
    </>
  )
}
