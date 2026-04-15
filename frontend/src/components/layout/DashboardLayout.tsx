import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
