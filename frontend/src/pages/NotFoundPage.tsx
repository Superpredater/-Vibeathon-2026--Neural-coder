import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 mb-6">
        <Zap size={22} className="text-white" />
      </div>
      <h1 className="text-6xl font-bold text-slate-900">404</h1>
      <p className="text-slate-500 mt-3 mb-8 max-w-sm">
        This page doesn't exist or you don't have permission to view it.
      </p>
      <Link
        to="/login"
        className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        Go to Sign in
      </Link>
    </div>
  )
}
