import { DollarSign, TrendingUp, TrendingDown, AlertCircle, FileText } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import SectionHeader from '../../components/dashboard/SectionHeader'
import DataTable from '../../components/dashboard/DataTable'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

const mockTransactions = [
  { id: 'TXN-001', type: 'Order Revenue', store: 'DS-North', amount: '₹ 1,240', margin: '+18.4%', date: 'Apr 15, 2026', status: 'settled' },
  { id: 'TXN-002', type: 'Refund', store: 'DS-South', amount: '₹ -320', margin: '—', date: 'Apr 15, 2026', status: 'processed' },
  { id: 'TXN-003', type: 'Inventory Write-off', store: 'DS-East', amount: '₹ -85', margin: '—', date: 'Apr 14, 2026', status: 'settled' },
  { id: 'TXN-004', type: 'Order Revenue', store: 'DS-West', amount: '₹ 2,100', margin: '+21.2%', date: 'Apr 14, 2026', status: 'settled' },
  { id: 'TXN-005', type: 'SLA Credit', store: 'DS-North', amount: '₹ -150', margin: '—', date: 'Apr 13, 2026', status: 'pending' },
]

const statusStyle: Record<string, string> = {
  settled: 'bg-emerald-50 text-emerald-700',
  processed: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
}

export default function FinanceDashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <SectionHeader
        title="Financial Overview"
        subtitle="Real-time unit economics and ledger summary."
        action={
          <div className="flex gap-2">
            <Button variant="secondary">Export CSV</Button>
            <Button variant="primary">Reconcile</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="GMV Today" value="₹ 4.2L" icon={<DollarSign size={18} className="text-emerald-600" />} iconBg="bg-emerald-50" trend={{ value: '8.3%', up: true }} />
        <StatCard label="Net Revenue" value="₹ 3.1L" icon={<TrendingUp size={18} className="text-brand-600" />} iconBg="bg-brand-50" trend={{ value: '5.1%', up: true }} />
        <StatCard label="Refund Liability" value="₹ 12,400" icon={<TrendingDown size={18} className="text-red-500" />} iconBg="bg-red-50" trend={{ value: '2.1%', up: false }} />
        <StatCard label="Margin-Negative Orders" value="3.2%" icon={<AlertCircle size={18} className="text-amber-500" />} iconBg="bg-amber-50" />
      </div>

      {/* Unit economics strip */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Avg. Basket Value', value: '₹ 348', sub: 'per order' },
          { label: 'Avg. Fulfillment Cost', value: '₹ 42', sub: 'per order' },
          { label: 'Avg. Net Contribution', value: '₹ 58', sub: 'per order' },
        ].map(item => (
          <div key={item.label} className="rounded-2xl bg-white shadow-card p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{item.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Recent Transactions</h2>
        <button className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">View ledger →</button>
      </div>
      <DataTable
        columns={[
          { key: 'id', header: 'Ref', render: r => <span className="font-mono text-xs">{r.id}</span> },
          { key: 'type', header: 'Type', render: r => <span className="font-medium text-slate-800">{r.type}</span> },
          { key: 'store', header: 'Dark Store', render: r => r.store },
          { key: 'amount', header: 'Amount', render: r => (
            <span className={r.amount.startsWith('₹ -') ? 'text-red-500 font-medium' : 'text-emerald-600 font-medium'}>
              {r.amount}
            </span>
          )},
          { key: 'margin', header: 'Margin', render: r => r.margin },
          { key: 'date', header: 'Date', render: r => <span className="text-slate-400 text-xs">{r.date}</span> },
          { key: 'status', header: 'Status', render: r => (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[r.status]}`}>
              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            </span>
          )},
        ]}
        data={mockTransactions}
      />
    </DashboardLayout>
  )
}
