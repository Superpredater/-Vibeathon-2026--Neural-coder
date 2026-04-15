import { useState, useEffect, useCallback } from 'react'

export interface IncomingOrder {
  id: string
  orderId: string
  customer: string
  address: string
  items: number
  distance: string
  value: string
  estimatedMin: number
  store: string
  arrivedAt: Date
  state: 'pending' | 'accepted' | 'rejected'
}

const POOL: Omit<IncomingOrder, 'id' | 'arrivedAt' | 'state'>[] = [
  { orderId: 'ORD-201', customer: 'Customer M', address: '14 Residency Rd, Bengaluru',  items: 2, distance: '1.4 km', value: '₹ 280', estimatedMin: 8,  store: 'DS-North' },
  { orderId: 'ORD-202', customer: 'Customer N', address: '9 Richmond Rd, Bengaluru',    items: 4, distance: '2.1 km', value: '₹ 510', estimatedMin: 11, store: 'DS-South' },
  { orderId: 'ORD-203', customer: 'Customer O', address: '31 Lavelle Rd, Bengaluru',    items: 1, distance: '0.8 km', value: '₹ 120', estimatedMin: 6,  store: 'DS-North' },
  { orderId: 'ORD-204', customer: 'Customer P', address: '55 Church St, Bengaluru',     items: 3, distance: '1.9 km', value: '₹ 390', estimatedMin: 10, store: 'DS-East'  },
  { orderId: 'ORD-205', customer: 'Customer Q', address: '7 St Marks Rd, Bengaluru',    items: 5, distance: '2.6 km', value: '₹ 640', estimatedMin: 13, store: 'DS-West'  },
  { orderId: 'ORD-206', customer: 'Customer R', address: '22 Cunningham Rd, Bengaluru', items: 2, distance: '1.1 km', value: '₹ 210', estimatedMin: 7,  store: 'DS-North' },
]

let poolIndex = 0

export function useIncomingOrders(batchLimit: number = 3, activeOrders: number = 0) {
  const [incoming, setIncoming] = useState<IncomingOrder[]>([])

  // Simulate a new order arriving every 30 seconds
  useEffect(() => {
    const push = () => {
      const template = POOL[poolIndex % POOL.length]
      poolIndex++
      const order: IncomingOrder = {
        ...template,
        id: `inc-${Date.now()}`,
        arrivedAt: new Date(),
        state: 'pending',
      }
      setIncoming(prev => [order, ...prev].slice(0, 10)) // keep last 10
    }

    // Push one immediately on mount
    push()
    const t = setInterval(push, 30000)
    return () => clearInterval(t)
  }, [])

  const pendingCount = incoming.filter(o => o.state === 'pending').length
  const canAccept = activeOrders < batchLimit

  const accept = useCallback((id: string) => {
    setIncoming(prev => prev.map(o => o.id === id ? { ...o, state: 'accepted' } : o))
  }, [])

  const reject = useCallback((id: string) => {
    setIncoming(prev => prev.map(o => o.id === id ? { ...o, state: 'rejected' } : o))
  }, [])

  const dismiss = useCallback((id: string) => {
    setIncoming(prev => prev.filter(o => o.id !== id))
  }, [])

  return { incoming, pendingCount, canAccept, accept, reject, dismiss }
}
