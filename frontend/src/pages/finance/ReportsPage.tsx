import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SectionHeader from '../../components/dashboard/SectionHeader'
import Button from '../../components/ui/Button'
import clsx from 'clsx'

const WEEKLY = [
  { week: 'Apr 7–13', gmv: 380000, cogs: 268000, fulfillment: 38000, refunds: 14000, net: 60000 },
  { week: 'Apr 14–15', gmv: 420800, cogs: 298400, fulfillment: 42000, refunds: 18600, net: 61800 },
]

const STORE_BREAKDOWN = [
  { store: 'DS-North', gmv: 142000, cogs: 98000, fulfillment: 14200, refunds: 4800, net: 25000 },
  { store: 'DS-South', gmv: 98000,  cogs: 68000, fulfillment:  9800, refunds: 3200, net: 17000 },
  { store: 'DS-East',  gmv: 54000,  cogs: 40000, fulfillment:  5400, refunds: 6200, net:  2400 },
  { store: 'DS-West',  gmv: 187000, cogs: 128000, fulfillment: 18700, refunds: 4400, net: 35900 },
]

function exportCSV() {
  const headers = ['Store', 'GMV', 'COGS', 'Fulfillment', 'Refunds', 'Net Revenue']
  const rows = STORE_BREAKDOWN.map(s =>
    [s.store, s.gmv, s.cogs, s.fulfillment, s.refunds, s.net].join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'finance_report.csv'; a.click()
  URL.revokeObjectURL(url)
}

const fmt = (n: number) => `₹ ${(n / 1000).toFixed(0)}K`

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <SectionHeader
        title="Financial Reports"
        subtitle="Weekly P&L and per-store unit economics."
        action={
          <Button variant="secondary" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </Button>
        }
      />

      {/* Weekly P&L */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Weekly P&L Summary</h2>
        <div className="rounded-2xl bg-white shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Period', 'GMV', 'COGS', 'Fulfillment', 'Refunds', 'Net Revenue', 'Margin %'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {WEEKLY.map(w => {
                const margin = ((w.net / w.gmv) * 100).toFixed(1)
                return (
                  <tr key={w.week} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{w.week}</td>
                    <td className="px-5 py-3.5 text-emerald-600 font-semibold">{fmt(w.gmv)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{fmt(w.cogs)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{fmt(w.fulfillment)}</td>
                    <td className="px-5 py-3.5 text-red-500">{fmt(w.refunds)}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{fmt(w.net)}</td>
                    <td className="px-5 py-3.5">
                      <span className={clsx('text-xs font-semibold', parseFloat(margin) > 12 ? 'text-emerald-600' : 'text-amber-600')}>
                        {margin}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Store breakdown bar chart */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Net Revenue by Dark Store</h2>
        <div className="rounded-2xl bg-white shadow-card p-6">
          <div className="space-y-4">
            {STORE_BREAKDOWN.map(s => {
              const maxNet = Math.max(...STORE_BREAKDOWN.map(x => x.net))
              const pct = (s.net / maxNet) * 100
              return (
                <div key={s.store} className="flex items-center gap-4">
                  <span className="w-20 text-sm font-semibold text-slate-700 flex-shrink-0">{s.store}</span>
                  <div className="flex-1 h-7 rounded-xl bg-slate-100 overflow-hidden">
                    <div
                      className={clsx('h-full rounded-xl flex items-center px-3 transition-all duration-500',
                        pct > 60 ? 'bg-gradient-to-r from-brand-500 to-brand-600' :
                        pct > 30 ? 'bg-gradient-to-r from-sky-400 to-sky-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'
                      )}
                      style={{ width: `${pct}%` }}
                    >
                      <span className="text-white text-xs font-semibold">{fmt(s.net)}</span>
                    </div>
                  </div>
                  <span className="w-16 text-xs text-slate-400 text-right flex-shrink-0">
                    {((s.net / s.gmv) * 100).toFixed(1)}% margin
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Per-store table */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Per-Store Unit Economics</h2>
        <div className="rounded-2xl bg-white shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Store', 'GMV', 'COGS', 'Fulfillment', 'Refunds', 'Net Revenue', 'Trend'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {STORE_BREAKDOWN.map(s => {
                const margin = (s.net / s.gmv) * 100
                return (
                  <tr key={s.store} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{s.store}</td>
                    <td className="px-5 py-3.5 text-emerald-600 font-medium">{fmt(s.gmv)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{fmt(s.cogs)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{fmt(s.fulfillment)}</td>
                    <td className="px-5 py-3.5 text-red-500">{fmt(s.refunds)}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{fmt(s.net)}</td>
                    <td className="px-5 py-3.5">
                      <span className={clsx('flex items-center gap-1 text-xs font-semibold', margin > 12 ? 'text-emerald-600' : 'text-amber-600')}>
                        {margin > 12 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
