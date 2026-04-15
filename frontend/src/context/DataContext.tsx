import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../api/client'
import { useAuth } from './AuthContext'

interface DataState {
  orders:     any[]
  users:      any[]
  ledger:     any[]
  invoices:   any[]
  deliveries: any[]
  couriers:   any[]
  stats:      any
  loading:    boolean
  error:      string | null
  refresh:    () => void
  // Mutators
  addLedgerEntry:   (body: unknown) => Promise<any>
  updateOrder:      (id: string, body: unknown) => Promise<any>
  updateDelivery:   (id: string, body: unknown) => Promise<any>
  updateInvoice:    (id: string, body: unknown) => Promise<any>
  updateCourier:    (id: string, body: unknown) => Promise<any>
  createOrder:      (body: unknown) => Promise<any>
  createDelivery:   (body: unknown) => Promise<any>
}

const DataContext = createContext<DataState | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const [orders,     setOrders]     = useState<any[]>([])
  const [users,      setUsers]      = useState<any[]>([])
  const [ledger,     setLedger]     = useState<any[]>([])
  const [invoices,   setInvoices]   = useState<any[]>([])
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [couriers,   setCouriers]   = useState<any[]>([])
  const [stats,      setStats]      = useState<any>(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true); setError(null)
    try {
      const role = user?.role
      const [ord, del, cou, st] = await Promise.all([
        api.getOrders(), api.getDeliveries(), api.getCouriers(), api.getStats(),
      ])
      setOrders(ord); setDeliveries(del); setCouriers(cou); setStats(st)

      if (role === 'company_admin') {
        const [u] = await Promise.all([api.getUsers()])
        setUsers(u)
      }
      if (role === 'finance_staff' || role === 'company_admin') {
        const [led, inv] = await Promise.all([api.getLedger(), api.getInvoices()])
        setLedger(led); setInvoices(inv)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.role])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return
    const t = setInterval(fetchAll, 30000)
    return () => clearInterval(t)
  }, [isAuthenticated, fetchAll])

  async function addLedgerEntry(body: unknown) {
    const entry = await api.addLedger(body)
    setLedger(prev => [entry, ...prev])
    const st = await api.getStats(); setStats(st)
    return entry
  }

  async function updateOrder(id: string, body: unknown) {
    const updated = await api.updateOrder(id, body)
    setOrders(prev => prev.map(o => o.id === id ? updated : o))
    const st = await api.getStats(); setStats(st)
    return updated
  }

  async function updateDelivery(id: string, body: unknown) {
    const updated = await api.updateDelivery(id, body)
    setDeliveries(prev => prev.map(d => d.id === id ? updated : d))
    const st = await api.getStats(); setStats(st)
    return updated
  }

  async function updateInvoice(id: string, body: unknown) {
    const updated = await api.updateInvoice(id, body)
    setInvoices(prev => prev.map(i => i.id === id ? updated : i))
    return updated
  }

  async function updateCourier(id: string, body: unknown) {
    const updated = await api.updateCourier(id, body)
    setCouriers(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }

  async function createOrder(body: unknown) {
    const order = await api.createOrder(body)
    setOrders(prev => [order, ...prev])
    const st = await api.getStats(); setStats(st)
    return order
  }

  async function createDelivery(body: unknown) {
    const del = await api.createDelivery(body)
    setDeliveries(prev => [del, ...prev])
    return del
  }

  return (
    <DataContext.Provider value={{
      orders, users, ledger, invoices, deliveries, couriers, stats,
      loading, error, refresh: fetchAll,
      addLedgerEntry, updateOrder, updateDelivery, updateInvoice,
      updateCourier, createOrder, createDelivery,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
