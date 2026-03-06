import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('c2e_token')
    const saved = localStorage.getItem('c2e_club')
    if (token && saved) {
      try {
        setClub(JSON.parse(saved))
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email, password, rememberMe) => {
    const res = await api.post('/api/auth/login', { email, password, rememberMe })
    const { token, club } = res.data
    localStorage.setItem('c2e_token', token)
    localStorage.setItem('c2e_club', JSON.stringify(club))
    setClub(club)
    return club
  }

  const signup = async (clubName, email, password) => {
    const res = await api.post('/api/auth/signup', { clubName, email, password })
    const { token, club } = res.data
    localStorage.setItem('c2e_token', token)
    localStorage.setItem('c2e_club', JSON.stringify(club))
    setClub(club)
    return club
  }

  const logout = () => {
    localStorage.removeItem('c2e_token')
    localStorage.removeItem('c2e_club')
    setClub(null)
  }

  return (
    <AuthContext.Provider value={{ club, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
