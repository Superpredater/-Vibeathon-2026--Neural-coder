import { useState } from 'react'
import { Search, Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SectionHeader from '../../components/dashboard/SectionHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useModal } from '../../hooks/useModal'
import { INVOICES, type Invoice } from '../../data/financeData'
import clsx from 'clsx'

const STATUS_STYLE: Record<Invoice['status'], string> = {
  paid:    'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  overdue: 'bg-red-50 text-red-600',
}
const STATUS_ICON: Record<Invoice['status'], React.ReactNode> = {
  paid:    <CheckCircle size={12} />,
  pending: <Clock size={12} />,
  overdue: <AlertTriangle size={12} />,
}

function exportCSV(data: Invoice[]) {
  const headers = ['ID', 'Vendor', 'Store', 'Category', 'Amount', 'Issued', 'Due', 'Status']
  const rows = data.map(i => [i.id, i.vendor, i.store, i.category, `₹ ${i.amount.toLocaleString()}`, i.issued, i.due, i.status].join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'invoices_export.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function InvoicesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status']>('all')
  const [invoices, setInvoices] = useState(INVOICES)
  const [selected, setSelected] = useState<Invoice | null>(null)
  const detailModal = useModal()

  const filtered = invoices.filter(i => {
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    const matchSearch = !search ||
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.vendor.toLowerCase().includes(search.toLowerCase()) ||
      i.store.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  function openDetail(inv: Invoice) { setSelected(inv); detailModal.openModal() }

  function markPaid(id: string) {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'paid' as const } : i))
    detailModal.closeModal()
  }

  const totals = {
    total:   invoices.reduce((s, i) => s + i.amount, 0),
    paid:    invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
    pending: invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500'

  return (
    <>
    <DashboardLayout>
      <SectionHeader
        title="Invoices"
        subtitle="Manage vendor invoices and payment status."
        action={
          <Button variant="secondary" onClick={() => exportCSV(filtered)}>
            <Download size={14} /> Export CSV
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Value',   value: totals.total,   color: 'text-slate-900' },
          { label: 'Paid',          value: totals.paid,    color: 'text-emerald-600' },
          { label: 'Pending',       value: totals.pending, color: 'text-amber-600' },
          { label: 'Overdue',       value: totals.overdue, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white shadow-card px-5 py-4">
            <p className={clsx('text-xl font-bold', s.color)}>₹ {s.value.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Overdue alert */}
      {totals.overdue > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-3.5 animate-fade-in">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            ₹ {totals.overdue.toLocaleString()} in overdue invoices — immediate payment required.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by ID, vendor, or store…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'paid', 'pending', 'overdue'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={clsx('rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all',
                statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              )}>{s === 'all' ? 'All' : s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Invoice ID', 'Vendor', 'Store', 'Category', 'Amount', 'Issued', 'Due', 'Status', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(inv => (
              <tr key={inv.id} className={clsx('hover:bg-slate-50 transition-colors cursor-pointer', inv.status === 'overdue' && 'bg-red-50/30')}
                onClick={() => openDetail(inv)}>
                <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700">{inv.id}</td>
                <td className="px-5 py-3.5 font-medium text-slate-900">{inv.vendor}</td>
                <td className="px-5 py-3.5 text-slate-500">{inv.store}</td>
                <td className="px-5 py-3.5 text-slate-500 text-xs">{inv.category}</td>
                <td className="px-5 py-3.5 font-semibold text-slate-800">₹ {inv.amount.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{inv.issued}</td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{inv.due}</td>
                <td className="px-5 py-3.5">
                  <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[inv.status])}>
                    {STATUS_ICON[inv.status]}{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs text-brand-600 font-medium hover:underline">View →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>

    {/* Invoice detail modal */}
    {selected && (
      <Modal
        open={detailModal.open}
        minimized={detailModal.minimized}
        title={`Invoice ${selected.id}`}
        subtitle={`${selected.vendor} · ${selected.store}`}
        onClose={detailModal.closeModal}
        onMinimize={detailModal.toggleMinimize}
        footer={
          <>
            <Button variant="secondary" onClick={detailModal.closeModal}>Close</Button>
            {selected.status !== 'paid' && (
              <Button variant="primary" onClick={() => markPaid(selected.id)}>
                <CheckCircle size={14} /> Mark as Paid
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Invoice ID',  value: selected.id },
              { label: 'Vendor',      value: selected.vendor },
              { label: 'Dark Store',  value: selected.store },
              { label: 'Category',    value: selected.category },
              { label: 'Amount',      value: `₹ ${selected.amount.toLocaleString()}` },
              { label: 'Issued',      value: selected.issued },
              { label: 'Due Date',    value: selected.due },
              { label: 'Status',      value: selected.status.charAt(0).toUpperCase() + selected.status.slice(1) },
            ].map(f => (
              <div key={f.label} className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400 font-medium">{f.label}</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>
          {selected.status === 'overdue' && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" />
              <p className="text-sm text-red-700 font-medium">This invoice is overdue. Please process payment immediately.</p>
            </div>
          )}
        </div>
      </Modal>
    )}
    </>
  )
}
