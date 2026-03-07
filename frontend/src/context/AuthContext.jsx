import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('c2e_token')
      if (token) {
        try {
          const res = await api.get('/api/auth/me')
          setUser(res.data.user)
          setRole(res.data.role)
        } catch {
          // Token invalid or expired
          localStorage.removeItem('c2e_token')
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (roleType, email, password, rememberMe) => {
    const res = await api.post(`/api/auth/${roleType}/login`, { email, password, rememberMe })
    const { token, user: userData, role: userRole } = res.data
    localStorage.setItem('c2e_token', token)
    setUser(userData)
    setRole(userRole)
    return { user: userData, role: userRole }
  }

  const signup = async (roleType, payload) => {
    // payload depends on the role
    const res = await api.post(`/api/auth/${roleType}/signup`, payload)
    const { token, user: userData, role: userRole } = res.data
    localStorage.setItem('c2e_token', token)
    setUser(userData)
    setRole(userRole)
    return { user: userData, role: userRole }
  }

  const logout = () => {
    localStorage.removeItem('c2e_token')
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
