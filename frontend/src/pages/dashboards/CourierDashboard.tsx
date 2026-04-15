import { useState } from 'react'
import { MapPin, Clock, CheckCircle, Star, Package, AlertTriangle, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import SectionHeader from '../../components/dashboard/SectionHeader'
import IncomingOrderCard from '../../components/dashboard/IncomingOrderCard'
import { useAuth } from '../../context/AuthContext'
import { useIncomingOrders } from '../../hooks/useIncomingOrders'
import clsx from 'clsx'

type AssignmentStatus = 'in_transit' | 'pending' | 'delivered' | 'undelivered'
interface Assignment { id: string; address: string; items: number; distance: string; status: AssignmentStatus; eta: string }

const INITIAL: Assignment[] = [
  { id: 'ORD-101', address: '12 MG Road, Bengaluru',  items: 3, distance: '1.2 km', status: 'in_transit', eta: '6 min' },
  { id: 'ORD-102', address: '45 Park St, Bengaluru',   items: 2, distance: '2.8 km', status: 'pending',    eta: '14 min' },
  { id: 'ORD-103', address: '7 Brigade Rd, Bengaluru', items: 1, distance: '0.9 km', status: 'delivered',  eta: '—' },
]

const STATUS_STYLE: Record<AssignmentStatus, string> = {
  in_transit: 'bg-sky-50 text-sky-700', pending: 'bg-amber-50 text-amber-700',
  delivered: 'bg-emerald-50 text-emerald-700', undelivered: 'bg-red-50 text-red-600',
}
const STATUS_LABEL: Record<AssignmentStatus, string> = {
  in_transit: 'In Transit', pending: 'Waiting', delivered: 'Delivered', undelivered: 'Undelivered',
}

const BATCH_LIMIT = 3

export default function CourierDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL)
  const [showIncoming, setShowIncoming] = useState(true)

  const activeCount = assignments.filter(a => ['in_transit','pending'].includes(a.status)).length
  const { incoming, pendingCount, canAccept, accept, reject, dismiss } = useIncomingOrders(BATCH_LIMIT, activeCount)

  function updateStatus(id: string, status: AssignmentStatus) {
    setAssignments(prev => prev.map(a =>
      a.id === id ? { ...a, status, eta: ['delivered','undelivered'].includes(status) ? '—' : a.eta } : a
    ))
  }

  function handleAccept(incId: string) {
    accept(incId)
    const order = incoming.find(o => o.id === incId)
    if (!order) return
    setAssignments(prev => [{
      id: order.orderId, address: order.address, items: order.items,
      distance: order.distance, status: 'pending', eta: `${order.estimatedMin} min`,
    }, ...prev])
  }

  return (
    <DashboardLayout>
      <SectionHeader
        title="My Deliveries"
        subtitle={`Hello ${user?.name || 'Courier'} — here are your active assignments.`}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Orders"      value={activeCount} icon={<MapPin size={18} className="text-sky-600" />}         iconBg="bg-sky-50" />
        <StatCard label="Completed Today"    value={11}          icon={<CheckCircle size={18} className="text-emerald-600" />} iconBg="bg-emerald-50" trend={{ value: '3', up: true }} />
        <StatCard label="Avg. Delivery Time" value="10.8 min"    icon={<Clock size={18} className="text-brand-600" />}         iconBg="bg-brand-50" />
        <StatCard label="Rating"             value="4.8 / 5"     icon={<Star size={18} className="text-amber-500" />}          iconBg="bg-amber-50" />
      </div>

      {/* Shift card */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-brand-200 text-sm font-medium">Current Shift</p>
            <p className="text-2xl font-bold mt-1">3h 24m active</p>
            <p className="text-brand-200 text-sm mt-1">Rest due in 36 minutes</p>
          </div>
          <div className="text-right">
            <p className="text-brand-200 text-sm">Today's earnings</p>
            <p className="text-2xl font-bold mt-1">₹ 842</p>
            <p className="text-brand-200 text-sm mt-1">11 deliveries</p>
          </div>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-white/20">
          <div className="h-1.5 rounded-full bg-white" style={{ width: '57%' }} />
        </div>
        <p className="text-xs text-brand-200 mt-1.5">57% of daily limit used (10h max)</p>
      </div>

      {/* Quick nav */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Delivery Map',   sub: 'Live route with timer',    to: '/courier/map',         color: 'from-sky-500 to-blue-600' },
          { label: 'My Performance', sub: 'Stats, charts, history',   to: '/courier/performance', color: 'from-emerald-500 to-teal-600' },
        ].map(link => (
          <button key={link.to} onClick={() => navigate(link.to)}
            className="group flex items-center gap-4 rounded-2xl bg-white shadow-card hover:shadow-card-hover p-5 text-left transition-all duration-200 active:scale-[0.99]">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${link.color}`}>
              <span className="text-white text-base font-bold">{link.label[0]}</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900">{link.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{link.sub}</p>
            </div>
            <span className="ml-auto text-slate-300 group-hover:text-brand-500 transition-colors">→</span>
          </button>
        ))}
      </div>

      {/* ── Incoming Orders ── */}
      <div className="mb-8">
        <button
          onClick={() => setShowIncoming(v => !v)}
          className="w-full flex items-center justify-between mb-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={18} className="text-slate-700" />
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold animate-pulse">
                  {pendingCount}
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              Incoming Orders
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                  {pendingCount} new
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!canAccept && (
              <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-lg">
                Batch full ({BATCH_LIMIT}/{BATCH_LIMIT})
              </span>
            )}
            <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
              {showIncoming ? '▲ Hide' : '▼ Show'}
            </span>
          </div>
        </button>

        {showIncoming && (
          <div className="space-y-4 animate-fade-in">
            {incoming.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-8 text-center">
                <Bell size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No incoming orders right now</p>
                <p className="text-xs text-slate-300 mt-1">New orders will appear here automatically</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {incoming.map(order => (
                  <IncomingOrderCard
                    key={order.id}
                    order={order}
                    canAccept={canAccept}
                    onAccept={() => handleAccept(order.id)}
                    onReject={() => reject(order.id)}
                    onDismiss={() => dismiss(order.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── My Assignments ── */}
      <h2 className="text-base font-semibold text-slate-900 mb-4">My Assignments</h2>
      <div className="space-y-3">
        {assignments.map(a => (
          <div key={a.id} className={clsx(
            'rounded-2xl bg-white shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4',
            a.status === 'delivered' && 'opacity-70'
          )}>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-700">{a.id}</span>
                <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[a.status])}>
                  {STATUS_LABEL[a.status]}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900">{a.address}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span><Package size={11} className="inline mr-1" />{a.items} items</span>
                <span><MapPin size={11} className="inline mr-1" />{a.distance}</span>
                {a.eta !== '—' && <span><Clock size={11} className="inline mr-1" />ETA {a.eta}</span>}
              </div>
            </div>

            {(a.status === 'in_transit' || a.status === 'pending') && (
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => updateStatus(a.id, 'in_transit')}
                  className={clsx('rounded-xl px-3 py-2 text-xs font-semibold transition-all',
                    a.status === 'in_transit' ? 'bg-sky-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-600'
                  )}>In Transit</button>
                <button onClick={() => updateStatus(a.id, 'delivered')}
                  className="rounded-xl px-3 py-2 text-xs font-semibold border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                  <CheckCircle size={13} className="inline mr-1" />Delivered
                </button>
                <button onClick={() => updateStatus(a.id, 'undelivered')}
                  className="rounded-xl px-3 py-2 text-xs font-semibold border border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all">
                  <AlertTriangle size={13} className="inline mr-1" />Undelivered
                </button>
              </div>
            )}

            {a.status === 'delivered' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 flex-shrink-0">
                <CheckCircle size={14} /> Completed
              </span>
            )}
            {a.status === 'undelivered' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500 flex-shrink-0">
                <AlertTriangle size={14} /> Not Delivered
              </span>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}