import { NavLink, useNavigate } from 'react-router-dom'
import {
  Zap, LayoutDashboard, Package, Truck, Users, DollarSign,
  BarChart3, Settings, LogOut, ChevronRight, Bell
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth, type Role } from '../../context/AuthContext'

interface NavItem { label: string; to: string; icon: React.ReactNode }

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  company_admin: [
    { label: 'Dashboard', to: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Users', to: '/admin/users', icon: <Users size={18} /> },
    { label: 'Orders', to: '/admin/orders', icon: <Package size={18} /> },
    { label: 'Analytics', to: '/admin/analytics', icon: <BarChart3 size={18} /> },
    { label: 'Ops Dashboard', to: '/ops', icon: <Truck size={18} /> },
    { label: 'Settings', to: '/admin/settings', icon: <Settings size={18} /> },
  ],
  delivery_staff: [
    { label: 'Dashboard', to: '/delivery', icon: <LayoutDashboard size={18} /> },
    { label: 'Deliveries', to: '/delivery/orders', icon: <Package size={18} /> },
    { label: 'Couriers', to: '/delivery/couriers', icon: <Truck size={18} /> },
    { label: 'Ops Dashboard', to: '/ops', icon: <BarChart3 size={18} /> },
  ],
  courier: [
    { label: 'My Deliveries', to: '/courier', icon: <LayoutDashboard size={18} /> },
    { label: 'My Performance', to: '/courier/performance', icon: <BarChart3 size={18} /> },
  ],
  finance_staff: [
    { label: 'Dashboard', to: '/finance',          icon: <LayoutDashboard size={18} /> },
    { label: 'Ledger',    to: '/finance/ledger',   icon: <DollarSign size={18} /> },
    { label: 'Invoices',  to: '/finance/invoices', icon: <Package size={18} /> },
    { label: 'Reports',   to: '/finance/reports',  icon: <BarChart3 size={18} /> },
  ],
}

const ROLE_LABELS: Record<Role, string> = {
  company_admin: 'Company Admin',
  delivery_staff: 'Delivery Staff',
  courier: 'Courier',
  finance_staff: 'Finance Staff',
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null
  const nav = NAV_BY_ROLE[user.role]

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-slate-100 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-semibold text-slate-900 text-sm">AQCLI Platform</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/delivery' || item.to === '/courier' || item.to === '/finance'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-100 p-3 space-y-1">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase">
            {user.name ? user.name[0] : user.email[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user.name || user.email}</p>
            <p className="text-xs text-slate-400 truncate">{ROLE_LABELS[user.role]}</p>
          </div>
          <Bell size={15} className="text-slate-400 hover:text-slate-600 cursor-pointer flex-shrink-0" />
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
