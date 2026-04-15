import clsx from 'clsx'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: ReactNode
  iconBg?: string
  trend?: { value: string; up: boolean }
}

export default function StatCard({ label, value, sub, icon, iconBg = 'bg-brand-50', trend }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-card p-5 flex flex-col gap-4 hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', iconBg)}>
          {icon}
        </div>
        {trend && (
          <span className={clsx(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            trend.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          )}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm font-medium text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
