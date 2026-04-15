import clsx from 'clsx'

type Status = 'active' | 'pending' | 'delivered' | 'delayed' | 'cancelled' | 'in_transit' | 'picking'

const styles: Record<Status, string> = {
  active:     'bg-emerald-50 text-emerald-700',
  pending:    'bg-amber-50 text-amber-700',
  delivered:  'bg-blue-50 text-blue-700',
  delayed:    'bg-red-50 text-red-600',
  cancelled:  'bg-slate-100 text-slate-500',
  in_transit: 'bg-sky-50 text-sky-700',
  picking:    'bg-violet-50 text-violet-700',
}

const labels: Record<Status, string> = {
  active: 'Active', pending: 'Pending', delivered: 'Delivered',
  delayed: 'Delayed', cancelled: 'Cancelled', in_transit: 'In Transit', picking: 'Picking',
}

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', styles[status])}>
      {labels[status]}
    </span>
  )
}
