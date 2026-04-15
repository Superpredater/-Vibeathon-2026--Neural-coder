import { useState } from 'react'
import { Search, UserPlus, MoreHorizontal, Shield, Truck, DollarSign, Building2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SectionHeader from '../../components/dashboard/SectionHeader'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/dashboard/StatusBadge'
import clsx from 'clsx'

const ALL_USERS = [
  { id: '1', name: 'Jane Smith',    email: 'jane@acme.com',     role: 'company_admin',  joined: 'Apr 10, 2026', status: 'active'   as const, lastLogin: '2h ago' },
  { id: '2', name: 'Alex Johnson',  email: 'alex@acme.com',     role: 'delivery_staff', joined: 'Apr 8, 2026',  status: 'active'   as const, lastLogin: '5h ago' },
  { id: '3', name: 'Sam Patel',     email: 'sam@acme.com',      role: 'courier',        joined: 'Apr 5, 2026',  status: 'pending'  as const, lastLogin: 'Never' },
  { id: '4', name: 'Riya Mehta',    email: 'riya@acme.com',     role: 'courier',        joined: 'Apr 1, 2026',  status: 'active'   as const, lastLogin: '1d ago' },
  { id: '5', name: 'Priya Sharma',  email: 'priya@acme.com',    role: 'finance_staff',  joined: 'Mar 28, 2026', status: 'active'   as const, lastLogin: '3h ago' },
  { id: '6', name: 'Arjun Das',     email: 'arjun@acme.com',    role: 'courier',        joined: 'Mar 20, 2026', status: 'active'   as const, lastLogin: '30m ago' },
  { id: '7', name: 'Neha Gupta',    email: 'neha@acme.com',     role: 'delivery_staff', joined: 'Mar 15, 2026', status: 'active'   as const, lastLogin: '1h ago' },
  { id: '8', name: 'Vikram Singh',  email: 'vikram@acme.com',   role: 'finance_staff',  joined: 'Mar 10, 2026', status: 'pending'  as const, lastLogin: 'Never' },
]

const ROLE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  company_admin:  { label: 'Company Admin',   icon: <Building2 size={12} />, color: 'bg-violet-50 text-violet-700' },
  delivery_staff: { label: 'Delivery Staff',  icon: <Truck size={12} />,     color: 'bg-sky-50 text-sky-700' },
  courier:        { label: 'Courier',         icon: <Truck size={12} />,     color: 'bg-emerald-50 text-emerald-700' },
  finance_staff:  { label: 'Finance Staff',   icon: <DollarSign size={12} />,color: 'bg-amber-50 text-amber-700' },
}

const ROLE_FILTERS = ['All', 'company_admin', 'delivery_staff', 'courier', 'finance_staff']

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')

  const filtered = ALL_USERS.filter(u => {
    const matchRole = roleFilter === 'All' || u.role === roleFilter
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const counts = {
    total: ALL_USERS.length,
    active: ALL_USERS.filter(u => u.status === 'active').length,
    pending: ALL_USERS.filter(u => u.status === 'pending').length,
  }

  return (
    <DashboardLayout>
      <SectionHeader
        title="User Management"
        subtitle="Manage all platform users across every role."
        action={
          <Button variant="primary">
            <UserPlus size={15} /> Invite User
          </Button>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users', value: counts.total, color: 'text-slate-900' },
          { label: 'Active',      value: counts.active,  color: 'text-emerald-600' },
          { label: 'Pending',     value: counts.pending, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white shadow-card px-5 py-4">
            <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ROLE_FILTERS.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={clsx(
                'rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150',
                roleFilter === r
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {r === 'All' ? 'All Roles' : ROLE_META[r]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['User', 'Role', 'Joined', 'Last Login', 'Status', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No users found.</td></tr>
            ) : filtered.map(u => {
              const meta = ROLE_META[u.role]
              return (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase flex-shrink-0">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', meta.color)}>
                      {meta.icon}{meta.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{u.joined}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{u.lastLogin}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={u.status} /></td>
                  <td className="px-5 py-3.5">
                    <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                      <MoreHorizontal size={15} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
