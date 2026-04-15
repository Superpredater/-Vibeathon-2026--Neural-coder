import { useState } from 'react'
import { Search, Download } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SectionHeader from '../../components/dashboard/SectionHeader'
import Button from '../../components/ui/Button'
import { LEDGER_ENTRIES } from '../../data/financeData'
import clsx from 'clsx'

const ACCOUNT_LABELS: Record<string, string> = {
  gmv: 'GMV', cogs: 'COGS', fulfillment: 'Fulfillment',
  refund: 'Refund', write_off: 'Write-off', sla_credit: 'SLA Credit', overhead: 'Overhead',
}

const ACCOUNT_COLORS: Record<string, string> = {
  gmv:         'bg-emerald-50 text-emerald-700',
  cogs:        'bg-slate-100 text-slate-600',
  fulfillment: 'bg-sky-50 text-sky-700',
  refund:      'bg-red-50 text-red-600',
  write_off:   'bg-orange-50 text-orange-600',
  sla_credit:  'bg-amber-50 text-amber-700',
  overhead:    'bg-violet-50 text-violet-700',
}

function exportCSV() {
  const headers = ['ID', 'Type', 'Account', 'Description', 'Order ID', 'Store', 'Amount', 'Date', 'Time']
  const rows = LEDGER_ENTRIES.map(e =>
    [e.id, e.type, ACCOUNT_LABELS[e.account] ?? e.account, e.description, e.orderId, e.store, `${e.currency} ${e.amount}`, e.date, e.time].join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'ledger_export.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function LedgerPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'debit' | 'credit'>('all')

  const filtered = LEDGER_ENTRIES.filter(e => {
    const matchType = typeFilter === 'all' || e.type === typeFilter
    const matchSearch = !search ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.orderId.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.store.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const totalDebits  = LEDGER_ENTRIES.filter(e => e.type === 'debit').reduce((s, e) => s + e.amount, 0)
  const totalCredits = LEDGER_ENTRIES.filter(e => e.type === 'credit').reduce((s, e) => s + e.amount, 0)
  const balanced = totalDebits === totalCredits

  return (
    <DashboardLayout>
      <SectionHeader
        title="Financial Ledger"
        subtitle="Immutable double-entry ledger — all financial events."
        action={
          <Button variant="secondary" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </Button>
        }
      />

      {/* Balance check */}
      <div className={clsx(
        'mb-6 flex items-center gap-3 rounded-2xl border px-5 py-3.5',
        balanced ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
      )}>
        <div className={clsx('h-2.5 w-2.5 rounded-full flex-shrink-0', balanced ? 'bg-emerald-500' : 'bg-red-500')} />
        <p className={clsx('text-sm font-semibold', balanced ? 'text-emerald-700' : 'text-red-700')}>
          {balanced ? 'Ledger balanced — all debits equal credits' : 'Imbalance detected — review required'}
        </p>
        <div className="ml-auto flex gap-6 text-sm">
          <span className="text-slate-500">Total Debits: <strong className="text-slate-800">₹ {totalDebits.toLocaleString()}</strong></span>
          <span className="text-slate-500">Total Credits: <strong className="text-slate-800">₹ {totalCredits.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by entry ID, order, description, store…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'credit', 'debit'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={clsx('rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-all',
                typeFilter === t ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              )}>
              {t === 'all' ? 'All' : t === 'credit' ? '↑ Credits' : '↓ Debits'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Entry ID', 'Type', 'Account', 'Description', 'Order', 'Store', 'Amount', 'Date'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-600">{e.id}</td>
                <td className="px-5 py-3.5">
                  <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    e.type === 'credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                  )}>
                    {e.type === 'credit' ? '↑ Credit' : '↓ Debit'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={clsx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', ACCOUNT_COLORS[e.account] ?? 'bg-slate-100 text-slate-600')}>
                    {ACCOUNT_LABELS[e.account] ?? e.account}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-700">{e.description}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{e.orderId}</td>
                <td className="px-5 py-3.5 text-slate-500 text-xs">{e.store}</td>
                <td className="px-5 py-3.5">
                  <span className={clsx('font-semibold', e.type === 'credit' ? 'text-emerald-600' : 'text-red-500')}>
                    {e.type === 'credit' ? '+' : '-'}{e.currency} {e.amount.toLocaleString()}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">{e.date} {e.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
