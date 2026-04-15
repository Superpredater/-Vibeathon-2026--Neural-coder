export type DeliveryStatus = 'in_transit' | 'picking' | 'pending' | 'delivered' | 'delayed' | 'cancelled'
export type CourierStatus = 'active' | 'resting' | 'suspended' | 'offline'

export interface Delivery {
  id: string
  orderId: string
  customer: string
  address: string
  items: number
  status: DeliveryStatus
  eta: string
  courierId: string | null
  store: string
  value: string
  created: string
}

export interface Courier {
  id: string
  name: string
  email: string
  phone: string
  vehicle: string
  status: CourierStatus
  activeOrders: number
  onTimeRate: string
  rating: number
  completedToday: number
  batchLimit: number
  hoursToday: string
}

export const DELIVERIES: Delivery[] = [
  { id: 'DEL-001', orderId: 'ORD-001', customer: 'Customer A', address: '12 MG Road, Bengaluru',       items: 3, status: 'in_transit', eta: '6 min',  courierId: 'C1', store: 'DS-North', value: '₹ 420', created: '14:32' },
  { id: 'DEL-002', orderId: 'ORD-002', customer: 'Customer B', address: '45 Park St, Bengaluru',        items: 2, status: 'picking',    eta: '11 min', courierId: 'C2', store: 'DS-South', value: '₹ 185', created: '14:28' },
  { id: 'DEL-003', orderId: 'ORD-003', customer: 'Customer C', address: '7 Brigade Rd, Bengaluru',      items: 5, status: 'pending',    eta: '—',      courierId: null, store: 'DS-East',  value: '₹ 540', created: '14:35' },
  { id: 'DEL-004', orderId: 'ORD-004', customer: 'Customer D', address: '88 Koramangala, Bengaluru',    items: 1, status: 'delivered',  eta: '—',      courierId: 'C3', store: 'DS-West',  value: '₹ 95',  created: '13:55' },
  { id: 'DEL-005', orderId: 'ORD-005', customer: 'Customer E', address: '22 Indiranagar, Bengaluru',    items: 4, status: 'delayed',    eta: '2 min',  courierId: 'C1', store: 'DS-North', value: '₹ 310', created: '14:20' },
  { id: 'DEL-006', orderId: 'ORD-006', customer: 'Customer F', address: '5 Whitefield, Bengaluru',      items: 6, status: 'in_transit', eta: '9 min',  courierId: 'C3', store: 'DS-West',  value: '₹ 620', created: '14:10' },
  { id: 'DEL-007', orderId: 'ORD-007', customer: 'Customer G', address: '33 HSR Layout, Bengaluru',     items: 2, status: 'pending',    eta: '—',      courierId: null, store: 'DS-South', value: '₹ 230', created: '14:40' },
  { id: 'DEL-008', orderId: 'ORD-008', customer: 'Customer H', address: '14 Jayanagar, Bengaluru',      items: 3, status: 'delivered',  eta: '—',      courierId: 'C2', store: 'DS-East',  value: '₹ 380', created: '13:30' },
]

export const COURIERS: Courier[] = [
  { id: 'C1', name: 'Sam Patel',    email: 'sam@aqcli.dev',    phone: '+91 98765 43210', vehicle: 'Bike',   status: 'active',    activeOrders: 2, onTimeRate: '94.2%', rating: 4.8, completedToday: 11, batchLimit: 3, hoursToday: '3h 24m' },
  { id: 'C2', name: 'Riya Mehta',   email: 'riya@aqcli.dev',   phone: '+91 87654 32109', vehicle: 'Scooter',status: 'active',    activeOrders: 1, onTimeRate: '97.1%', rating: 4.9, completedToday: 8,  batchLimit: 3, hoursToday: '2h 10m' },
  { id: 'C3', name: 'Arjun Das',    email: 'arjun@aqcli.dev',  phone: '+91 76543 21098', vehicle: 'Bike',   status: 'active',    activeOrders: 2, onTimeRate: '91.5%', rating: 4.7, completedToday: 14, batchLimit: 3, hoursToday: '4h 05m' },
  { id: 'C4', name: 'Neha Gupta',   email: 'neha@aqcli.dev',   phone: '+91 65432 10987', vehicle: 'Scooter',status: 'resting',   activeOrders: 0, onTimeRate: '96.8%', rating: 4.9, completedToday: 9,  batchLimit: 3, hoursToday: '4h 00m' },
  { id: 'C5', name: 'Vikram Singh', email: 'vikram@aqcli.dev', phone: '+91 54321 09876', vehicle: 'Van',    status: 'suspended', activeOrders: 0, onTimeRate: '72.3%', rating: 3.9, completedToday: 3,  batchLimit: 1, hoursToday: '1h 20m' },
  { id: 'C6', name: 'Priya Nair',   email: 'priya.n@aqcli.dev',phone: '+91 43210 98765', vehicle: 'Bike',   status: 'offline',   activeOrders: 0, onTimeRate: '98.0%', rating: 5.0, completedToday: 0,  batchLimit: 3, hoursToday: '0h 00m' },
]
