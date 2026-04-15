import { useEffect, type ReactNode } from 'react'
import { X, Minus } from 'lucide-react'
import clsx from 'clsx'

interface ModalProps {
  open: boolean
  minimized: boolean
  title: string
  subtitle?: string
  onClose: () => void
  onMinimize: () => void
  children: ReactNode
  footer?: ReactNode
  width?: string
}

export default function Modal({
  open, minimized, title, subtitle, onClose, onMinimize, children, footer, width = 'max-w-md'
}: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  // Minimized — show floating pill at bottom-right
  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
        <button
          onClick={onMinimize}
          className="flex items-center gap-3 rounded-2xl bg-white shadow-card-hover border border-slate-200 px-4 py-3 hover:shadow-lg transition-all duration-150"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
            <span className="text-white text-xs font-bold">↑</span>
          </div>
          <span className="text-sm font-semibold text-slate-800">{title}</span>
          <X
            size={14}
            className="text-slate-400 hover:text-red-500 transition-colors ml-1"
            onClick={e => { e.stopPropagation(); onClose() }}
          />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={clsx(
        'relative w-full rounded-2xl bg-white shadow-2xl animate-slide-up flex flex-col',
        width
      )}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={onMinimize}
              title="Minimize"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
