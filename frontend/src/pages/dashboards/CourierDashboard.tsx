import { useState } from 'react'
import { MapPin, Clock, CheckCircle, Star, Package, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import SectionHeader from '../../components/dashboard/SectionHeader'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

type AssignmentStatus = 'in_transit' | 'pending' | 'delivered' | 'undelivered'

interface Assignment {
  id: string
  address: string
  items: number
  distance: string
  status: AssignmentStatus
  eta: string
}

const INITIAL: Assignment[] = [
  { id: 'ORD-101', address: '12 MG Road, Bengaluru',    items: 3, distance: '1.2 km', status: 'in_transit', eta: '6 min' },
  { id: 'ORD-102', address: '45 Park St, Bengaluru',     items: 2, distance: '2.8 km', status: 'pending',    eta: '14 min' },
  { id: 'ORD-103', address: '7 Brigade Rd, Bengaluru',   items: 1, distance: '0.9 km', status: 'delivered',  eta: '—' },
]

const STATUS_STYLE: Record<AssignmentStatus, string> = {
  in_transit:  'bg-sky-50 text-sky-700',
  pending:     'bg-amber-50 text-amber-700',
  delivered:   'bg-emerald-50 text-emerald-700',
  undelivered: 'bg-red-50 text-red-600',
}
const STATUS_LABEL: Record<AssignmentStatus, string> = {
  in_transit: 'In Transit', pending: 'Waiting', delivered: 'Delivered', undelivered: 'Undelivered',
}

export default function CourierDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL)

  function updateStatus(id: string, status: AssignmentStatus) {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status, eta: status === 'delivered' || status === 'undelivered' ? '—' : a.eta } : a))
  }

  const active    = assignments.filter(a => ['in_transit','pending'].includes(a.status)).length
  const delivered = assignments.filter(a => a.status === 'delivered').length

  return (
    <DashboardLayout>
      <SectionHeader
        title="My Deliveries"
        subtitle={`Hello ${user?.name || 'Courier'} — here are your active assignments.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Orders"      value={active}    icon={<MapPin size={18} className="text-sky-600" />}        iconBg="bg-sky-50" />
        <StatCard label="Completed Today"    value={11}        icon={<CheckCircle size={18} className="text-emerald-600" />} iconBg="bg-emerald-50" trend={{ value: '3', up: true }} />
        <StatCard label="Avg. Delivery Time" value="10.8 min"  icon={<Clock size={18} className="text-brand-600" />}        iconBg="bg-brand-50" />
        <StatCard label="Rating"             value="4.8 / 5"   icon={<Star size={18} className="text-amber-500" />}         iconBg="bg-amber-50" />
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
          { label: 'Delivery Map',    sub: 'Live route with timer',         to: '/courier/map',         color: 'from-sky-500 to-blue-600' },
          { label: 'My Performance',  sub: 'Stats, charts, history',        to: '/courier/performance', color: 'from-emerald-500 to-teal-600' },
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

      {/* My Assignments */}
      <h2 className="text-base font-semibold text-slate-900 mb-4">My Assignments</h2>
      <div className="space-y-3">
        {assignments.map(a => (
          <div key={a.id} className={clsx(
            'rounded-2xl bg-white shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4',
            a.status === 'delivered' && 'opacity-70'
          )}>
            {/* Info */}
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

            {/* Action buttons */}
            {(a.status === 'in_transit' || a.status === 'pending') && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => updateStatus(a.id, 'in_transit')}
                  className={clsx(
                    'rounded-xl px-3 py-2 text-xs font-semibold transition-all',
                    a.status === 'in_transit'
                      ? 'bg-sky-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-600'
                  )}>
                  In Transit
                </button>
                <button
                  onClick={() => updateStatus(a.id, 'delivered')}
                  className="rounded-xl px-3 py-2 text-xs font-semibold border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                  <CheckCircle size={13} className="inline mr-1" />Delivered
                </button>
                <button
                  onClick={() => updateStatus(a.id, 'undelivered')}
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
