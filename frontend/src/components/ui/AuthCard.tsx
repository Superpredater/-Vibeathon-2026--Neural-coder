import type { ReactNode } from 'react'

interface AuthCardProps {
  children: ReactNode
  className?: string
}

export default function AuthCard({ children, className = '' }: AuthCardProps) {
  return (
    <div className={`w-full rounded-2xl bg-white shadow-card p-8 animate-slide-up ${className}`}>
      {children}
    </div>
  )
}
