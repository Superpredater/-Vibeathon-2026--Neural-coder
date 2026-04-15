import { useState } from 'react'
import { Activity, AlertTriangle, Package, Truck, Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import SectionHeader from '../../components/dashboard/SectionHeader'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { useModal } from '../../hooks/useModal'
import clsx from 'clsx'

/* ── mock data ── */
const darkStores = [
  { id: 'DS-North', mode: 'NORMAL',   sla: '97.8%', stock: 94, orders: 142, couriers: 8 },
  { id: 'DS-South', mode: 'NORMAL',   sla: '96.1%', stock: 88, orders: 98,  couriers: 6 },
  { id: 'DS-East',  mode: 'DEGRADED', sla: '89.4%', stock: 71, orders: 54,  couriers: 4 },
  { id: 'DS-West',  mode: 'NORMAL',   sla: '98.2%', stock: 97, orders: 187, couriers: 11 },
]

const subsystems = [
  { name: 'Order_Orchestrator',  status: 'healthy' },
  { name: 'Inventory_Manager',   status: 'healthy' },
  { name: 'Demand_Forecaster',   status: 'healthy' },
  { name: 'Route_Optimizer',     status: 'degraded' },
  { name: 'Slot_Scheduler',      status: 'healthy' },
  { name: 'Fraud_Engine',        status: 'healthy' },
  { name: 'Cold_Chain_Monitor',  status: 'healthy' },
  { name: 'Financial_Ledger',    status: 'healthy' },
  { name: 'Notification_Service',status: 'healthy' },
  { name: 'Config_Engine',       status: 'healthy' },
]

const HELD_ORDERS = [
  { id: 'ORD-009', customer: 'Customer X', value: '₹ 540', reason: 'High fraud score (82/100)', store: 'DS-North' },
  { id: 'ORD-010', customer: 'Customer Y', value: '₹ 1,200', reason: 'Address flagged (5 returns)', store: 'DS-South' },
  { id: 'ORD-011', customer: 'Customer Z', value: '₹ 320', reason: 'Payment method velocity', store: 'DS-East' },
]

const modeStyle: Record<string, string> = {
  NORMAL:   'bg-emerald-50 text-emerald-700',
  DEGRADED: 'bg-red-50 text-red-600',
  MANUAL:   'bg-amber-50 text-amber-700',
  SUSPENDED:'bg-slate-100 text-slate-500',
}

/* ── component ── */
export default function OpsDashboard() {
  const hasDegraded = darkStores.some(s => s.mode === 'DEGRADED')

  // Modal states
  const assignOrder   = useModal()
  const assignCourier = useModal()
  const reviewOrders  = useModal()

  // Assign Order form state
  const [assignOrderForm, setAssignOrderForm] = useState({ orderId: '', storeId: '', reason: '' })
  const [assignOrderDone, setAssignOrderDone] = useState(false)

  // Assign Courier form state
  const [assignCourierForm, setAssignCourierForm] = useState({ orderId: '', courierId: '', reason: '' })
  const [assignCourierDone, setAssignCourierDone] = useState(false)

  // Review orders state
  const [heldOrders, setHeldOrders] = useState(HELD_ORDERS)
  const [reviewAction, setReviewAction] = useState<Record<string, 'approved' | 'rejected' | null>>({})

  function handleAssignOrder() {
    if (!assignOrderForm.orderId || !assignOrderForm.storeId) return
    setAssignOrderDone(true)
    setTimeout(() => { setAssignOrderDone(false); assignOrder.closeModal(); setAssignOrderForm({ orderId: '', storeId: '', reason: '' }) }, 1800)
  }

  function handleAssignCourier() {
    if (!assignCourierForm.orderId || !assignCourierForm.courierId) return
    setAssignCourierDone(true)
    setTimeout(() => { setAssignCourierDone(false); assignCourier.closeModal(); setAssignCourierForm({ orderId: '', courierId: '', reason: '' }) }, 1800)
  }

  function handleReview(id: string, action: 'approved' | 'rejected') {
    setReviewAction(prev => ({ ...prev, [id]: action }))
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all'
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5'

  return (
    <DashboardLayout>
      {/* Degraded banner */}
      {hasDegraded && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 animate-fade-in">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Degraded Mode Active — DS-East</p>
            <p className="text-xs text-red-500 mt-0.5">Route_Optimizer is unavailable. Orders are queued. Use manual controls below.</p>
          </div>
        </div>
      )}

      <SectionHeader title="Operations Dashboard" subtitle="Real-time network health across all dark stores." />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Orders"    value="481"   icon={<Package size={18} className="text-brand-600" />}    iconBg="bg-brand-50"   trend={{ value: '7%', up: true }} />
        <StatCard label="In Transit"       value="214"   icon={<Truck size={18} className="text-sky-600" />}        iconBg="bg-sky-50" />
        <StatCard label="SLA Breach Rate"  value="2.8%"  icon={<AlertTriangle size={18} className="text-amber-500" />} iconBg="bg-amber-50"   trend={{ value: '0.4%', up: false }} />
        <StatCard label="Network Health"   value="96.4%" icon={<Activity size={18} className="text-emerald-600" />} iconBg="bg-emerald-50"  trend={{ value: '1.2%', up: true }} />
      </div>

      {/* Dark store grid */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Dark Store Network</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {darkStores.map(store => (
            <div key={store.id} className="rounded-2xl bg-white shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm">{store.id}</span>
                <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', modeStyle[store.mode])}>
                  {store.mode}
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">SLA Rate</span>
                  <span className={clsx('font-semibold', parseFloat(store.sla) < 95 ? 'text-red-500' : 'text-emerald-600')}>{store.sla}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Stock Health</span>
                  <span className="font-semibold text-slate-800">{store.stock}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100">
                  <div className={clsx('h-1.5 rounded-full', store.stock > 85 ? 'bg-emerald-500' : store.stock > 60 ? 'bg-amber-400' : 'bg-red-400')} style={{ width: `${store.stock}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{store.orders} orders</span>
                  <span>{store.couriers} couriers</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subsystem health */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Subsystem Health</h2>
        <div className="rounded-2xl bg-white shadow-card p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {subsystems.map(s => (
              <div key={s.name} className={clsx('flex items-center gap-2 rounded-xl px-3 py-2.5', s.status === 'healthy' ? 'bg-emerald-50' : 'bg-red-50')}>
                {s.status === 'healthy'
                  ? <Wifi size={13} className="text-emerald-500 flex-shrink-0" />
                  : <WifiOff size={13} className="text-red-500 flex-shrink-0" />}
                <span className={clsx('text-xs font-medium truncate', s.status === 'healthy' ? 'text-emerald-700' : 'text-red-600')}>
                  {s.name.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual override controls */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Manual Override Controls</h2>
        <div className="rounded-2xl bg-white shadow-card p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Assign Order to Dark Store', desc: 'Manually route a held order to a specific store', action: 'Assign Order', onClick: assignOrder.openModal },
            { label: 'Assign Courier to Order',    desc: 'Manually assign an available courier to an order', action: 'Assign Courier', onClick: assignCourier.openModal },
            { label: 'Approve / Reject Held Order',desc: 'Review and action orders in manual review hold', action: 'Review Orders', onClick: reviewOrders.openModal },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-slate-100 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={item.onClick}
                className="w-full rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold py-2 hover:bg-brand-100 active:scale-[0.98] transition-all duration-150"
              >
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal 1: Assign Order to Dark Store ── */}
      <Modal
        open={assignOrder.open}
        minimized={assignOrder.minimized}
        title="Assign Order to Dark Store"
        subtitle="Manually route a queued order to a specific store."
        onClose={() => { assignOrder.closeModal(); setAssignOrderDone(false) }}
        onMinimize={assignOrder.toggleMinimize}
        footer={
          assignOrderDone ? null : (
            <>
              <Button variant="secondary" onClick={assignOrder.closeModal}>Cancel</Button>
              <Button variant="primary" onClick={handleAssignOrder}>Confirm Assignment</Button>
            </>
          )
        }
      >
        {assignOrderDone ? (
          <div className="flex flex-col items-center gap-3 py-4 animate-fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-900">Order assigned successfully</p>
            <p className="text-sm text-slate-500">The order has been routed to the selected dark store.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Order ID <span className="text-red-400">*</span></label>
              <select className={inputCls} value={assignOrderForm.orderId} onChange={e => setAssignOrderForm(f => ({ ...f, orderId: e.target.value }))}>
                <option value="">Select a queued order…</option>
                <option value="ORD-005">ORD-005 — Customer E (₹ 310)</option>
                <option value="ORD-009">ORD-009 — Customer X (₹ 540)</option>
                <option value="ORD-010">ORD-010 — Customer Y (₹ 1,200)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Target Dark Store <span className="text-red-400">*</span></label>
              <select className={inputCls} value={assignOrderForm.storeId} onChange={e => setAssignOrderForm(f => ({ ...f, storeId: e.target.value }))}>
                <option value="">Select a dark store…</option>
                {darkStores.filter(s => s.mode !== 'SUSPENDED').map(s => (
                  <option key={s.id} value={s.id}>{s.id} — {s.mode} — Stock {s.stock}%</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Override Reason</label>
              <textarea
                rows={3}
                placeholder="e.g. Original store went offline mid-pick…"
                value={assignOrderForm.reason}
                onChange={e => setAssignOrderForm(f => ({ ...f, reason: e.target.value }))}
                className={inputCls + ' resize-none'}
              />
            </div>
            {(!assignOrderForm.orderId || !assignOrderForm.storeId) && (
              <p className="text-xs text-amber-600">* Order ID and Dark Store are required.</p>
            )}
          </div>
        )}
      </Modal>

      {/* ── Modal 2: Assign Courier to Order ── */}
      <Modal
        open={assignCourier.open}
        minimized={assignCourier.minimized}
        title="Assign Courier to Order"
        subtitle="Manually assign an available courier to a pending order."
        onClose={() => { assignCourier.closeModal(); setAssignCourierDone(false) }}
        onMinimize={assignCourier.toggleMinimize}
        footer={
          assignCourierDone ? null : (
            <>
              <Button variant="secondary" onClick={assignCourier.closeModal}>Cancel</Button>
              <Button variant="primary" onClick={handleAssignCourier}>Confirm Assignment</Button>
            </>
          )
        }
      >
        {assignCourierDone ? (
          <div className="flex flex-col items-center gap-3 py-4 animate-fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-900">Courier assigned successfully</p>
            <p className="text-sm text-slate-500">The courier has been dispatched to the order.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Order ID <span className="text-red-400">*</span></label>
              <select className={inputCls} value={assignCourierForm.orderId} onChange={e => setAssignCourierForm(f => ({ ...f, orderId: e.target.value }))}>
                <option value="">Select an order…</option>
                <option value="ORD-005">ORD-005 — Customer E — DS-North</option>
                <option value="ORD-002">ORD-002 — Customer B — DS-South</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Courier <span className="text-red-400">*</span></label>
              <select className={inputCls} value={assignCourierForm.courierId} onChange={e => setAssignCourierForm(f => ({ ...f, courierId: e.target.value }))}>
                <option value="">Select an available courier…</option>
                <option value="c1">Sam Patel — 2 active orders — Rating 4.8</option>
                <option value="c2">Riya Mehta — 1 active order — Rating 4.9</option>
                <option value="c3">Arjun Das — 0 active orders — Rating 4.7</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Override Reason</label>
              <textarea
                rows={3}
                placeholder="e.g. Original courier went offline…"
                value={assignCourierForm.reason}
                onChange={e => setAssignCourierForm(f => ({ ...f, reason: e.target.value }))}
                className={inputCls + ' resize-none'}
              />
            </div>
            {(!assignCourierForm.orderId || !assignCourierForm.courierId) && (
              <p className="text-xs text-amber-600">* Order and Courier are required.</p>
            )}
          </div>
        )}
      </Modal>

      {/* ── Modal 3: Review Held Orders ── */}
      <Modal
        open={reviewOrders.open}
        minimized={reviewOrders.minimized}
        title="Review Held Orders"
        subtitle="Approve or reject orders flagged by the Fraud Engine."
        onClose={reviewOrders.closeModal}
        onMinimize={reviewOrders.toggleMinimize}
        width="max-w-2xl"
        footer={
          <Button variant="secondary" onClick={reviewOrders.closeModal}>Close</Button>
        }
      >
        <div className="space-y-3">
          {heldOrders.map(order => {
            const action = reviewAction[order.id]
            return (
              <div key={order.id} className={clsx(
                'rounded-xl border p-4 transition-all duration-200',
                action === 'approved' ? 'border-emerald-200 bg-emerald-50' :
                action === 'rejected' ? 'border-red-200 bg-red-50' :
                'border-slate-100 bg-slate-50'
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-700">{order.id}</span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-sm font-medium text-slate-800">{order.customer}</span>
                      <span className="text-xs font-semibold text-slate-600">{order.value}</span>
                    </div>
                    <p className="text-xs text-slate-500">Store: {order.store}</p>
                    <p className="text-xs text-amber-700 font-medium">⚠ {order.reason}</p>
                  </div>

                  {action ? (
                    <div className={clsx('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold flex-shrink-0',
                      action === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    )}>
                      {action === 'approved' ? <CheckCircle size={13} /> : <XCircle size={13} />}
                      {action === 'approved' ? 'Approved' : 'Rejected'}
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReview(order.id, 'approved')}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button
                        onClick={() => handleReview(order.id, 'rejected')}
                        className="flex items-center gap-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold px-3 py-1.5 hover:bg-red-600 transition-colors"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Modal>
    </DashboardLayout>
  )
}
