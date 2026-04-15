export interface LedgerEntry {
  id: string
  type: 'debit' | 'credit'
  account: string
  description: string
  orderId: string
  store: string
  amount: number
  currency: string
  date: string
  time: string
}

export interface Invoice {
  id: string
  vendor: string
  store: string
  category: string
  amount: number
  issued: string
  due: string
  status: 'paid' | 'pending' | 'overdue'
}

export const LEDGER_ENTRIES: LedgerEntry[] = [
  { id: 'LE-001', type: 'credit', account: 'gmv',         description: 'Order revenue',          orderId: 'ORD-001', store: 'DS-North', amount:  420,  currency: '₹', date: 'Apr 15, 2026', time: '14:32' },
  { id: 'LE-002', type: 'debit',  account: 'cogs',        description: 'Cost of goods sold',     orderId: 'ORD-001', store: 'DS-North', amount:  280,  currency: '₹', date: 'Apr 15, 2026', time: '14:32' },
  { id: 'LE-003', type: 'debit',  account: 'fulfillment', description: 'Delivery cost',          orderId: 'ORD-001', store: 'DS-North', amount:   42,  currency: '₹', date: 'Apr 15, 2026', time: '14:33' },
  { id: 'LE-004', type: 'credit', account: 'gmv',         description: 'Order revenue',          orderId: 'ORD-002', store: 'DS-South', amount:  185,  currency: '₹', date: 'Apr 15, 2026', time: '14:28' },
  { id: 'LE-005', type: 'debit',  account: 'cogs',        description: 'Cost of goods sold',     orderId: 'ORD-002', store: 'DS-South', amount:  120,  currency: '₹', date: 'Apr 15, 2026', time: '14:28' },
  { id: 'LE-006', type: 'debit',  account: 'refund',      description: 'Customer refund',        orderId: 'ORD-003', store: 'DS-East',  amount:  320,  currency: '₹', date: 'Apr 15, 2026', time: '13:55' },
  { id: 'LE-007', type: 'credit', account: 'refund',      description: 'Refund offset',          orderId: 'ORD-003', store: 'DS-East',  amount:  320,  currency: '₹', date: 'Apr 15, 2026', time: '13:55' },
  { id: 'LE-008', type: 'debit',  account: 'write_off',   description: 'Inventory expiry',       orderId: '—',       store: 'DS-West',  amount:   85,  currency: '₹', date: 'Apr 14, 2026', time: '22:00' },
  { id: 'LE-009', type: 'credit', account: 'gmv',         description: 'Order revenue',          orderId: 'ORD-007', store: 'DS-West',  amount: 2100,  currency: '₹', date: 'Apr 14, 2026', time: '11:10' },
  { id: 'LE-010', type: 'debit',  account: 'cogs',        description: 'Cost of goods sold',     orderId: 'ORD-007', store: 'DS-West',  amount: 1540,  currency: '₹', date: 'Apr 14, 2026', time: '11:10' },
  { id: 'LE-011', type: 'debit',  account: 'fulfillment', description: 'Delivery cost',          orderId: 'ORD-007', store: 'DS-West',  amount:   42,  currency: '₹', date: 'Apr 14, 2026', time: '11:11' },
  { id: 'LE-012', type: 'debit',  account: 'sla_credit',  description: 'SLA Tier-2 credit',      orderId: 'ORD-004', store: 'DS-East',  amount:  150,  currency: '₹', date: 'Apr 13, 2026', time: '09:45' },
]

export const INVOICES: Invoice[] = [
  { id: 'INV-001', vendor: 'Amul Dairy',       store: 'DS-North', category: 'Inventory',   amount: 48000, issued: 'Apr 10, 2026', due: 'Apr 20, 2026', status: 'pending' },
  { id: 'INV-002', vendor: 'Britannia Foods',  store: 'DS-South', category: 'Inventory',   amount: 32000, issued: 'Apr 8, 2026',  due: 'Apr 18, 2026', status: 'paid' },
  { id: 'INV-003', vendor: 'Cold Chain Co.',   store: 'DS-East',  category: 'Logistics',   amount: 12500, issued: 'Apr 5, 2026',  due: 'Apr 15, 2026', status: 'overdue' },
  { id: 'INV-004', vendor: 'Packaging Plus',   store: 'DS-West',  category: 'Operations',  amount:  8400, issued: 'Apr 12, 2026', due: 'Apr 22, 2026', status: 'pending' },
  { id: 'INV-005', vendor: 'ITC Limited',      store: 'DS-North', category: 'Inventory',   amount: 61000, issued: 'Apr 1, 2026',  due: 'Apr 11, 2026', status: 'paid' },
  { id: 'INV-006', vendor: 'Delivery Fleet',   store: 'DS-South', category: 'Logistics',   amount: 22000, issued: 'Apr 14, 2026', due: 'Apr 24, 2026', status: 'pending' },
]

export const RECONCILIATION = {
  date: 'Apr 15, 2026',
  store: 'All Stores',
  gmv:        420800,
  cogs:       298400,
  fulfillment: 42000,
  refunds:     18600,
  writeOffs:    4200,
  slaCredits:   3200,
  netRevenue: 54400,
  outstandingFailures: 2,
}
