import { useState } from 'react'
import { Search, Download, Plus, CheckCircle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SectionHeader from '../../components/dashboard/SectionHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useModal } from '../../hooks/useModal'
import { LEDGER_ENTRIES, type LedgerEntry } from '../../data/financeData'
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

const ACCOUNTS = ['gmv', 'cogs', 'fulfillment', 'refund', 'write_off', 'sla_credit', 'overhead']
const STORES   = ['DS-North', 'DS-South', 'DS-East', 'DS-West']

interface NewEntry {
  type: 'credit' | 'debit'
  account: string
  description: string
  orderId: string
  store: string
  amount: string
}

const EMPTY: NewEntry = { type: 'credit', account: 'gmv', description: '', orderId: '', store: 'DS-North', amount: '' }

function exportCSV(entries: LedgerEntry[]) {
  const headers = ['ID', 'Type', 'Account', 'Description', 'Order ID', 'Store', 'Amount', 'Date', 'Time']
  const rows = entries.map(e =>
    [e.id, e.type, ACCOUNT_LABELS[e.account] ?? e.account, e.description, e.orderId, e.store, `${e.currency} ${e.amount}`, e.date, e.time].join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'ledger_export.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>(LEDGER_ENTRIES)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'debit' | 'credit'>('all')
  const addModal = useModal()
  const [form, setForm] = useState<NewEntry>(EMPTY)
  const [formErrors, setFormErrors] = useState<Partial<NewEntry>>({})
  const [addDone, setAddDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const filtered = entries.filter(e => {
    const matchType = typeFilter === 'all' || e.type === typeFilter
    const matchSearch = !search ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.orderId.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.store.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const totalDebits  = entries.filter(e => e.type === 'debit').reduce((s, e) => s + e.amount, 0)
  const totalCredits = entries.filter(e => e.type === 'credit').reduce((s, e) => s + e.amount, 0)
  const balanced = totalDebits === totalCredits

  function setField<K extends keyof NewEntry>(k: K, v: NewEntry[K]) {
    setForm(f => ({ ...f, [k]: v }))
    setFormErrors(e => ({ ...e, [k]: undefined }))
  }

  function validate(): boolean {
    const errs: Partial<NewEntry> = {}
    if (!form.description.trim()) errs.description = 'Required'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleAdd() {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const now = new Date()
      const newEntry: LedgerEntry = {
        id:          `LE-${String(entries.length + 1).padStart(3, '0')}`,
        type:        form.type,
        account:     form.account,
        description: form.description.trim(),
        orderId:     form.orderId.trim() || '—',
        store:       form.store,
        amount:      Number(form.amount),
        currency:    '₹',
        date:        now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time:        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      }
      setEntries(prev => [newEntry, ...prev])
      setLoading(false)
      setAddDone(true)
      setTimeout(() => {
        setAddDone(false)
        addModal.closeModal()
        setForm(EMPTY)
      }, 1500)
    }, 800)
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all'
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5'

  return (
    <>
    <DashboardLayout>
      <SectionHeader
        title="Financial Ledger"
        subtitle="Immutable double-entry ledger — all financial events."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportCSV(entries)}>
              <Download size={14} /> Export CSV
            </Button>
            <Button variant="primary" onClick={() => { setForm(EMPTY); setFormErrors({}); setAddDone(false); addModal.openModal() }}>
              <Plus size={14} /> Add Entry
            </Button>
          </div>
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
          <input type="text" placeholder="Search by entry ID, order, description, store…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
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
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">No entries found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>

    {/* Add Ledger Entry Modal */}
    <Modal
      open={addModal.open}
      minimized={addModal.minimized}
      title="Add Ledger Entry"
      subtitle="Manually record a new financial event."
      onClose={() => { addModal.closeModal(); setAddDone(false) }}
      onMinimize={addModal.toggleMinimize}
      footer={
        addDone ? null : (
          <>
            <Button variant="secondary" onClick={addModal.closeModal}>Cancel</Button>
            <Button variant="primary" loading={loading} onClick={handleAdd}>
              <Plus size={14} /> Add to Ledger
            </Button>
          </>
        )
      }
    >
      {addDone ? (
        <div className="flex flex-col items-center gap-3 py-4 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle size={24} className="text-emerald-600" />
          </div>
          <p className="font-semibold text-slate-900">Entry added to ledger</p>
          <p className="text-sm text-slate-500">The new entry is now visible at the top of the ledger.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Type toggle */}
          <div>
            <label className={labelCls}>Entry Type</label>
            <div className="flex gap-2">
              {(['credit', 'debit'] as const).map(t => (
                <button key={t} onClick={() => setField('type', t)}
                  className={clsx(
                    'flex-1 rounded-xl border py-2.5 text-sm font-semibold capitalize transition-all',
                    form.type === t
                      ? t === 'credit'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-red-400 bg-red-50 text-red-600'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  )}>
                  {t === 'credit' ? '↑ Credit' : '↓ Debit'}
                </button>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <label className={labelCls}>Account <span className="text-red-400">*</span></label>
            <select className={inputCls} value={form.account} onChange={e => setField('account', e.target.value)}>
              {ACCOUNTS.map(a => (
                <option key={a} value={a}>{ACCOUNT_LABELS[a]}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description <span className="text-red-400">*</span></label>
            <input className={clsx(inputCls, formErrors.description && 'border-red-400 focus:ring-red-400')}
              placeholder="e.g. Order revenue, Delivery cost…"
              value={form.description} onChange={e => setField('description', e.target.value)} />
            {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className={labelCls}>Amount (₹) <span className="text-red-400">*</span></label>
              <input type="number" min="1" className={clsx(inputCls, formErrors.amount && 'border-red-400 focus:ring-red-400')}
                placeholder="e.g. 420"
                value={form.amount} onChange={e => setField('amount', e.target.value)} />
              {formErrors.amount && <p className="text-xs text-red-500 mt-1">{formErrors.amount}</p>}
            </div>

            {/* Store */}
            <div>
              <label className={labelCls}>Dark Store</label>
              <select className={inputCls} value={form.store} onChange={e => setField('store', e.target.value)}>
                {STORES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Order ID */}
          <div>
            <label className={labelCls}>Order ID (optional)</label>
            <input className={inputCls} placeholder="e.g. ORD-012"
              value={form.orderId} onChange={e => setField('orderId', e.target.value)} />
          </div>

          {/* Preview */}
          {form.amount && !isNaN(Number(form.amount)) && Number(form.amount) > 0 && (
            <div className={clsx('rounded-xl border px-4 py-3 text-sm animate-fade-in',
              form.type === 'credit' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            )}>
              <p className="text-xs text-slate-500 mb-1">Preview</p>
              <p className={clsx('font-semibold', form.type === 'credit' ? 'text-emerald-700' : 'text-red-600')}>
                {form.type === 'credit' ? '+' : '-'}₹ {Number(form.amount).toLocaleString()} · {ACCOUNT_LABELS[form.account]} · {form.store}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
    </>
  )
}
