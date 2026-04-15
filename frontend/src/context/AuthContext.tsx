import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Role = 'company_admin' | 'delivery_staff' | 'courier' | 'finance_staff'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  tenantId: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseJwt(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: payload.user_id ?? payload.sub ?? '',
      name: payload.name ?? '',
      email: payload.email ?? '',
      role: payload.role as Role,
      tenantId: payload.tenant_id ?? '',
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('aqcli_token'))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const t = sessionStorage.getItem('aqcli_token')
    return t ? parseJwt(t) : null
  })

  function login(newToken: string) {
    sessionStorage.setItem('aqcli_token', newToken)
    setToken(newToken)
    setUser(parseJwt(newToken))
  }

  function logout() {
    sessionStorage.removeItem('aqcli_token')
    setToken(null)
    setUser(null)
  }

  // Auto-logout on token expiry
  useEffect(() => {
    if (!token) return
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]))
      const ms = exp * 1000 - Date.now()
      if (ms <= 0) { logout(); return }
      const t = setTimeout(logout, ms)
      return () => clearTimeout(t)
    } catch { logout() }
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
