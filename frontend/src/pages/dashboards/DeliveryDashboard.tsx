import { Package, Truck, Clock, CheckCircle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import SectionHeader from '../../components/dashboard/SectionHeader'
import DataTable from '../../components/dashboard/DataTable'
import StatusBadge from '../../components/dashboard/StatusBadge'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

const mockDeliveries = [
  { id: 'ORD-001', courier: 'Sam Patel', address: '12 MG Road, Bengaluru', items: 3, status: 'in_transit' as const, eta: '6 min' },
  { id: 'ORD-002', courier: 'Riya Mehta', address: '45 Park St, Bengaluru', items: 2, status: 'picking' as const, eta: '11 min' },
  { id: 'ORD-003', courier: 'Unassigned', address: '7 Brigade Rd, Bengaluru', items: 5, status: 'pending' as const, eta: '—' },
  { id: 'ORD-004', courier: 'Arjun Das', address: '88 Koramangala, Bengaluru', items: 1, status: 'delivered' as const, eta: '—' },
]

export default function DeliveryDashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <SectionHeader
        title={`Delivery Operations`}
        subtitle="Manage and track all active deliveries."
        action={<Button variant="primary">Assign Delivery</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Deliveries" value="38" icon={<Truck size={18} className="text-sky-600" />} iconBg="bg-sky-50" trend={{ value: '5', up: true }} />
        <StatCard label="Pending Assignment" value="7" icon={<Package size={18} className="text-amber-600" />} iconBg="bg-amber-50" />
        <StatCard label="Avg. Delivery Time" value="11.4 min" icon={<Clock size={18} className="text-brand-600" />} iconBg="bg-brand-50" trend={{ value: '0.8 min', up: false }} />
        <StatCard label="Completed Today" value="214" icon={<CheckCircle size={18} className="text-emerald-600" />} iconBg="bg-emerald-50" trend={{ value: '18%', up: true }} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Active Deliveries</h2>
        <button className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">View all →</button>
      </div>
      <DataTable
        columns={[
          { key: 'id', header: 'Order ID', render: r => <span className="font-mono text-xs font-medium">{r.id}</span> },
          { key: 'courier', header: 'Courier', render: r => (
            <span className={r.courier === 'Unassigned' ? 'text-amber-600 font-medium' : 'text-slate-700'}>{r.courier}</span>
          )},
          { key: 'address', header: 'Delivery Address', render: r => <span className="text-slate-500 text-xs">{r.address}</span> },
          { key: 'items', header: 'Items', render: r => r.items },
          { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
          { key: 'eta', header: 'ETA', render: r => r.eta },
          { key: 'action', header: '', render: r => r.courier === 'Unassigned'
            ? <Button variant="ghost" className="text-xs py-1 px-2">Assign</Button>
            : null
          },
        ]}
        data={mockDeliveries}
      />
    </DashboardLayout>
  )
}
