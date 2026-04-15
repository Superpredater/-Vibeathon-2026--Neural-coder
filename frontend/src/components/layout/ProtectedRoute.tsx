import { Navigate } from 'react-router-dom'
import { useAuth, type Role } from '../../context/AuthContext'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  allowedRoles?: Role[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && user && !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />

  return <>{children}</>
}
