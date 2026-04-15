import { Activity, AlertTriangle, Package, Truck, Thermometer, Wifi, WifiOff } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import SectionHeader from '../../components/dashboard/SectionHeader'
import StatusBadge from '../../components/dashboard/StatusBadge'
import clsx from 'clsx'

const darkStores = [
  { id: 'DS-North', mode: 'NORMAL', sla: '97.8%', stock: 94, orders: 142, couriers: 8 },
  { id: 'DS-South', mode: 'NORMAL', sla: '96.1%', stock: 88, orders: 98, couriers: 6 },
  { id: 'DS-East',  mode: 'DEGRADED', sla: '89.4%', stock: 71, orders: 54, couriers: 4 },
  { id: 'DS-West',  mode: 'NORMAL', sla: '98.2%', stock: 97, orders: 187, couriers: 11 },
]

const modeStyle: Record<string, string> = {
  NORMAL:   'bg-emerald-50 text-emerald-700',
  DEGRADED: 'bg-red-50 text-red-600',
  MANUAL:   'bg-amber-50 text-amber-700',
  SUSPENDED:'bg-slate-100 text-slate-500',
}

const subsystems = [
  { name: 'Order_Orchestrator', status: 'healthy' },
  { name: 'Inventory_Manager',  status: 'healthy' },
  { name: 'Demand_Forecaster',  status: 'healthy' },
  { name: 'Route_Optimizer',    status: 'degraded' },
  { name: 'Slot_Scheduler',     status: 'healthy' },
  { name: 'Fraud_Engine',       status: 'healthy' },
  { name: 'Cold_Chain_Monitor', status: 'healthy' },
  { name: 'Financial_Ledger',   status: 'healthy' },
  { name: 'Notification_Service', status: 'healthy' },
  { name: 'Config_Engine',      status: 'healthy' },
]

export default function OpsDashboard() {
  const hasDegraded = darkStores.some(s => s.mode === 'DEGRADED')

  return (
    <DashboardLayout>
      {/* Degraded mode banner */}
      {hasDegraded && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 animate-fade-in">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Degraded Mode Active — DS-East</p>
            <p className="text-xs text-red-500 mt-0.5">Route_Optimizer is unavailable. Orders are queued. Manual assignment available below.</p>
          </div>
          <button className="ml-auto text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 transition-colors">
            View Details
          </button>
        </div>
      )}

      <SectionHeader
        title="Operations Dashboard"
        subtitle="Real-time network health across all dark stores."
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Orders" value="481" icon={<Package size={18} className="text-brand-600" />} iconBg="bg-brand-50" trend={{ value: '7%', up: true }} />
        <StatCard label="In Transit" value="214" icon={<Truck size={18} className="text-sky-600" />} iconBg="bg-sky-50" />
        <StatCard label="SLA Breach Rate" value="2.8%" icon={<AlertTriangle size={18} className="text-amber-500" />} iconBg="bg-amber-50" trend={{ value: '0.4%', up: false }} />
        <StatCard label="Network Health" value="96.4%" icon={<Activity size={18} className="text-emerald-600" />} iconBg="bg-emerald-50" trend={{ value: '1.2%', up: true }} />
      </div>

      {/* Dark store health map */}
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
                  <span className={clsx('font-semibold', parseFloat(store.sla) < 95 ? 'text-red-500' : 'text-emerald-600')}>
                    {store.sla}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Stock Health</span>
                  <span className="font-semibold text-slate-800">{store.stock}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100">
                  <div
                    className={clsx('h-1.5 rounded-full transition-all', store.stock > 85 ? 'bg-emerald-500' : store.stock > 60 ? 'bg-amber-400' : 'bg-red-400')}
                    style={{ width: `${store.stock}%` }}
                  />
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
              <div key={s.name} className={clsx(
                'flex items-center gap-2 rounded-xl px-3 py-2.5',
                s.status === 'healthy' ? 'bg-emerald-50' : 'bg-red-50'
              )}>
                {s.status === 'healthy'
                  ? <Wifi size={13} className="text-emerald-500 flex-shrink-0" />
                  : <WifiOff size={13} className="text-red-500 flex-shrink-0" />
                }
                <span className={clsx('text-xs font-medium truncate', s.status === 'healthy' ? 'text-emerald-700' : 'text-red-600')}>
                  {s.name.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual override panel */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Manual Override Controls</h2>
        <div className="rounded-2xl bg-white shadow-card p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Assign Order to Dark Store', desc: 'Manually route a held order to a specific store', action: 'Assign Order' },
            { label: 'Assign Courier to Order', desc: 'Manually assign an available courier to an order', action: 'Assign Courier' },
            { label: 'Approve / Reject Held Order', desc: 'Review and action orders in manual review hold', action: 'Review Orders' },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-slate-100 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <button className="w-full rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold py-2 hover:bg-brand-100 transition-colors">
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
