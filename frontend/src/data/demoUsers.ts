import type { Role } from '../context/AuthContext'

export interface DemoUser {
  email: string
  password: string
  name: string
  role: Role
  label: string
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: 'admin@aqcli.dev',
    password: 'Admin@1234',
    name: 'Jane Smith',
    role: 'company_admin',
    label: 'Company Admin',
  },
  {
    email: 'delivery@aqcli.dev',
    password: 'Delivery@1234',
    name: 'Alex Johnson',
    role: 'delivery_staff',
    label: 'Delivery Staff',
  },
  {
    email: 'courier@aqcli.dev',
    password: 'Courier@1234',
    name: 'Sam Patel',
    role: 'courier',
    label: 'Courier',
  },
  {
    email: 'finance@aqcli.dev',
    password: 'Finance@1234',
    name: 'Priya Sharma',
    role: 'finance_staff',
    label: 'Finance Staff',
  },
]

export function findDemoUser(email: string, password: string): DemoUser | null {
  return DEMO_USERS.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  ) ?? null
}

export function makeFakeJwt(user: DemoUser): string {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    user_id:   user.email,
    name:      user.name,
    email:     user.email,
    role:      user.role,
    tenant_id: 'demo-tenant',
    exp:       Math.floor(Date.now() / 1000) + 86400, // 24 h
  }))
  return `${header}.${payload}.demo-sig`
}
