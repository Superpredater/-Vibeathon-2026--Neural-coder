import { useNavigate } from 'react-router-dom'
import type { Role } from '../context/AuthContext'

const ROLE_ROUTES: Record<Role, string> = {
  company_admin: '/admin',
  delivery_staff: '/delivery',
  courier: '/courier',
  finance_staff: '/finance',
}

export function useRoleRedirect() {
  const navigate = useNavigate()
  return (role: Role) => navigate(ROLE_ROUTES[role], { replace: true })
}

export { ROLE_ROUTES }
