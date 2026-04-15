import { MapPin, Clock, CheckCircle, Star } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import SectionHeader from '../../components/dashboard/SectionHeader'
import DataTable from '../../components/dashboard/DataTable'
import StatusBadge from '../../components/dashboard/StatusBadge'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

const mockAssignments = [
  { id: 'ORD-101', address: '12 MG Road, Bengaluru', items: 3, status: 'in_transit' as const, eta: '6 min', distance: '1.2 km' },
  { id: 'ORD-102', address: '45 Park St, Bengaluru', items: 2, status: 'pending' as const, eta: '14 min', distance: '2.8 km' },
  { id: 'ORD-103', address: '7 Brigade Rd, Bengaluru', items: 1, status: 'delivered' as const, eta: '—', distance: '0.9 km' },
]

export default function CourierDashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <SectionHeader
        title={`My Deliveries`}
        subtitle={`Hello ${user?.name || 'Courier'} — here are your active assignments.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Orders" value="2" icon={<MapPin size={18} className="text-sky-600" />} iconBg="bg-sky-50" />
        <StatCard label="Completed Today" value="11" icon={<CheckCircle size={18} className="text-emerald-600" />} iconBg="bg-emerald-50" trend={{ value: '3', up: true }} />
        <StatCard label="Avg. Delivery Time" value="10.8 min" icon={<Clock size={18} className="text-brand-600" />} iconBg="bg-brand-50" />
        <StatCard label="Rating" value="4.8 / 5" icon={<Star size={18} className="text-amber-500" />} iconBg="bg-amber-50" />
      </div>

      {/* Active shift info */}
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

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">My Assignments</h2>
      </div>
      <DataTable
        columns={[
          { key: 'id', header: 'Order ID', render: r => <span className="font-mono text-xs font-medium">{r.id}</span> },
          { key: 'address', header: 'Delivery Address', render: r => <span className="text-slate-500 text-xs">{r.address}</span> },
          { key: 'items', header: 'Items', render: r => r.items },
          { key: 'distance', header: 'Distance', render: r => r.distance },
          { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
          { key: 'eta', header: 'ETA', render: r => r.eta },
          { key: 'action', header: '', render: r => r.status === 'in_transit'
            ? <Button variant="primary" className="text-xs py-1 px-3">Mark Delivered</Button>
            : null
          },
        ]}
        data={mockAssignments}
      />
    </DashboardLayout>
  )
}
