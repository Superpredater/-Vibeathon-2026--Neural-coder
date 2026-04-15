import { CheckCircle, XCircle, MapPin, Package, Clock, Store, X } from 'lucide-react'
import type { IncomingOrder } from '../../hooks/useIncomingOrders'
import clsx from 'clsx'

interface Props {
  order: IncomingOrder
  canAccept: boolean
  onAccept: () => void
  onReject: () => void
  onDismiss: () => void
}

const STATE_STYLE = {
  pending:  'border-brand-200 bg-white',
  accepted: 'border-emerald-300 bg-emerald-50',
  rejected: 'border-slate-200 bg-slate-50 opacity-60',
}

export default function IncomingOrderCard({ order, canAccept, onAccept, onReject, onDismiss }: Props) {
  const age = Math.floor((Date.now() - order.arrivedAt.getTime()) / 1000)
  const ageLabel = age < 60 ? `${age}s ago` : `${Math.floor(age / 60)}m ago`

  return (
    <div className={clsx(
      'rounded-2xl border-2 p-4 transition-all duration-300 relative',
      STATE_STYLE[order.state],
      order.state === 'pending' && 'shadow-card'
    )}>
      {/* Dismiss button */}
      {order.state !== 'pending' && (
        <button onClick={onDismiss}
          className="absolute top-3 right-3 text-slate-300 hover:text-slate-500 transition-colors">
          <X size={14} />
        </button>
      )}

      {/* New badge */}
      {order.state === 'pending' && (
        <div className="absolute -top-2.5 left-4 flex items-center gap-1.5 rounded-full bg-brand-600 px-2.5 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-bold text-white">New Order</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mt-1 mb-3">
        <div>
          <span className="font-mono text-xs font-semibold text-slate-600">{order.orderId}</span>
          <p className="font-semibold text-slate-900 text-sm mt-0.5">{order.customer}</p>
        </div>
        <span className="text-xs text-slate-400">{ageLabel}</span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={12} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">{order.address}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Store size={12} className="text-slate-400 flex-shrink-0" />
          <span>{order.store}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Package size={12} className="text-slate-400 flex-shrink-0" />
          <span>{order.items} items · {order.value}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock size={12} className="text-slate-400 flex-shrink-0" />
          <span>{order.distance} · ~{order.estimatedMin} min</span>
        </div>
      </div>

      {/* Action buttons or result */}
      {order.state === 'pending' ? (
        <div className="flex gap-2">
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all active:scale-[0.98]">
            <XCircle size={14} /> Reject
          </button>
          <button
            onClick={onAccept}
            disabled={!canAccept}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all active:scale-[0.98]',
              canAccept
                ? 'bg-brand-600 text-white hover:bg-brand-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}>
            <CheckCircle size={14} />
            {canAccept ? 'Accept' : 'Batch Full'}
          </button>
        </div>
      ) : (
        <div className={clsx(
          'flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold',
          order.state === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
        )}>
          {order.state === 'accepted'
            ? <><CheckCircle size={13} /> Accepted — added to your assignments</>
            : <><XCircle size={13} /> Rejected</>}
        </div>
      )}
    </div>
  )
}
