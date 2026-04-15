import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold',
        'transition-all duration-150 active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        fullWidth && 'w-full',
        variant === 'primary' && [
          'bg-brand-600 text-white shadow-sm',
          'hover:bg-brand-700 focus:ring-brand-500',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        ],
        variant === 'secondary' && [
          'border border-slate-200 bg-white text-slate-700 shadow-sm',
          'hover:bg-slate-50 hover:border-slate-300 focus:ring-brand-500',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        ],
        variant === 'ghost' && [
          'text-brand-600 hover:bg-brand-50 focus:ring-brand-500',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        ],
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin-slow" />}
      {children}
    </button>
  )
}
