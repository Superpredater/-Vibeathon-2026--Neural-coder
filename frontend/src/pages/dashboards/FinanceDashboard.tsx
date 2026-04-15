import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Download, CheckCircle, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import SectionHeader from '../../components/dashboard/SectionHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useModal } from '../../hooks/useModal'
import { LEDGER_ENTRIES, RECONCILIATION } from '../../data/financeData'
import clsx from 'clsx'

const RECENT_TXN = [
  { id: 'TXN-001', type: 'Order Revenue',       store: 'DS-North', amount:  1240, positive: true,  date: 'Apr 15, 2026', status: 'settled' },
  { id: 'TXN-002', type: 'Refund',              store: 'DS-South', amount:  -320, positive: false, date: 'Apr 15, 2026', status: 'processed' },
  { id: 'TXN-003', type: 'Inventory Write-off', store: 'DS-East',  amount:   -85, positive: false, date: 'Apr 14, 2026', status: 'settled' },
  { id: 'TXN-004', type: 'Order Revenue',       store: 'DS-West',  amount:  2100, positive: true,  date: 'Apr 14, 2026', status: 'settled' },
  { id: 'TXN-005', type: 'SLA Credit',          store: 'DS-North', amount:  -150, positive: false, date: 'Apr 13, 2026', status: 'pending' },
]

const STATUS_STYLE: Record<string, string> = {
  settled:   'bg-emerald-50 text-emerald-700',
  processed: 'bg-blue-50 text-blue-700',
  pending:   'bg-amber-50 text-amber-700',
}

function exportCSV() {
  const headers = ['ID', 'Type', 'Store', 'Amount', 'Date', 'Status']
  const rows = RECENT_TXN.map(t => [t.id, t.type, t.store, `₹ ${Math.abs(t.amount)}`, t.date, t.status].join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'transactions_export.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function FinanceDashboard() {
  const navigate = useNavigate()
  const reconcileModal = useModal()
  const [reconciling, setReconciling] = useState(false)
  const [reconcileDone, setReconcileDone] = useState(false)

  function handleReconcile() {
    setReconciling(true)
    setTimeout(() => { setReconciling(false); setReconcileDone(true) }, 1800)
  }

  const R = RECONCILIATION

  return (
    <>
    <DashboardLayout>
      <SectionHeader
        title="Financial Overview"
        subtitle="Real-time unit economics and ledger summary."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportCSV}>
              <Download size={14} /> Export CSV
            </Button>
            <Button variant="primary" onClick={reconcileModal.openModal}>
              <RefreshCw size={14} /> Reconcile
            </Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="GMV Today"              value="₹ 4.2L" icon={<DollarSign size={18} className="text-emerald-600" />} iconBg="bg-emerald-50" trend={{ value: '8.3%', up: true }} />
        <StatCard label="Net Revenue"            value="₹ 3.1L" icon={<TrendingUp size={18} className="text-brand-600" />}   iconBg="bg-brand-50"   trend={{ value: '5.1%', up: true }} />
        <StatCard label="Refund Liability"       value="₹ 12,400" icon={<TrendingDown size={18} className="text-red-500" />} iconBg="bg-red-50"     trend={{ value: '2.1%', up: false }} />
        <StatCard label="Margin-Negative Orders" value="3.2%"   icon={<AlertCircle size={18} className="text-amber-500" />}  iconBg="bg-amber-50" />
      </div>

      {/* Unit economics strip */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Avg. Basket Value',      value: '₹ 348', sub: 'per order' },
          { label: 'Avg. Fulfillment Cost',  value: '₹ 42',  sub: 'per order' },
          { label: 'Avg. Net Contribution',  value: '₹ 58',  sub: 'per order' },
        ].map(item => (
          <div key={item.label} className="rounded-2xl bg-white shadow-card p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{item.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'View Ledger',  sub: 'Full double-entry ledger',    to: '/finance/ledger',   color: 'from-brand-500 to-brand-600' },
          { label: 'Invoices',     sub: 'Vendor invoices & payments',  to: '/finance/invoices', color: 'from-emerald-500 to-teal-600' },
          { label: 'Reports',      sub: 'Weekly P&L & store breakdown', to: '/finance/reports',  color: 'from-amber-500 to-orange-500' },
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

      {/* Recent transactions */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Recent Transactions</h2>
        <button onClick={() => navigate('/finance/ledger')} className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
          View ledger →
        </button>
      </div>
      <div className="rounded-2xl bg-white shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Ref', 'Type', 'Dark Store', 'Amount', 'Date', 'Status'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {RECENT_TXN.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs">{t.id}</td>
                <td className="px-5 py-3.5 font-medium text-slate-800">{t.type}</td>
                <td className="px-5 py-3.5 text-slate-500">{t.store}</td>
                <td className="px-5 py-3.5">
                  <span className={clsx('font-semibold', t.positive ? 'text-emerald-600' : 'text-red-500')}>
                    {t.positive ? '+' : ''}₹ {Math.abs(t.amount).toLocaleString()}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{t.date}</td>
                <td className="px-5 py-3.5">
                  <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[t.status])}>
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>

    {/* Reconcile Modal */}
    <Modal
      open={reconcileModal.open}
      minimized={reconcileModal.minimized}
      title="Daily Reconciliation"
      subtitle={`${R.date} · ${R.store}`}
      onClose={() => { reconcileModal.closeModal(); setReconcileDone(false) }}
      onMinimize={reconcileModal.toggleMinimize}
      width="max-w-lg"
      footer={
        reconcileDone ? (
          <Button variant="secondary" onClick={() => { reconcileModal.closeModal(); setReconcileDone(false) }}>Close</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={reconcileModal.closeModal}>Cancel</Button>
            <Button variant="primary" loading={reconciling} onClick={handleReconcile}>
              <RefreshCw size={14} /> Run Reconciliation
            </Button>
          </>
        )
      }
    >
      {reconcileDone ? (
        <div className="flex flex-col items-center gap-3 py-4 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle size={24} className="text-emerald-600" />
          </div>
          <p className="font-semibold text-slate-900">Reconciliation complete</p>
          <p className="text-sm text-slate-500 text-center">All entries balanced. Report saved to ledger.</p>
          <div className="w-full rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Net Revenue</span><span className="font-bold text-emerald-600">₹ {R.netRevenue.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Outstanding Failures</span><span className={clsx('font-semibold', R.outstandingFailures > 0 ? 'text-red-500' : 'text-emerald-600')}>{R.outstandingFailures}</span></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 mb-4">Review the summary below before running reconciliation.</p>
          {[
            { label: 'Gross Merchandise Value', value: R.gmv,         color: 'text-emerald-600', prefix: '+' },
            { label: 'Cost of Goods Sold',       value: R.cogs,        color: 'text-red-500',     prefix: '-' },
            { label: 'Fulfillment Cost',          value: R.fulfillment, color: 'text-red-500',     prefix: '-' },
            { label: 'Refunds',                   value: R.refunds,     color: 'text-red-500',     prefix: '-' },
            { label: 'Inventory Write-offs',      value: R.writeOffs,   color: 'text-red-500',     prefix: '-' },
            { label: 'SLA Credits',               value: R.slaCredits,  color: 'text-red-500',     prefix: '-' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-600">{row.label}</span>
              <span className={clsx('text-sm font-semibold', row.color)}>{row.prefix}₹ {row.value.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200">
            <span className="font-bold text-slate-900">Net Revenue</span>
            <span className="font-bold text-emerald-600 text-lg">₹ {R.netRevenue.toLocaleString()}</span>
          </div>
          {R.outstandingFailures > 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-2 mt-2">
              <AlertCircle size={15} className="text-amber-500" />
              <p className="text-sm text-amber-700">{R.outstandingFailures} outstanding payment failure(s) require manual review.</p>
            </div>
          )}
        </div>
      )}
    </Modal>
    </>
  )
}
