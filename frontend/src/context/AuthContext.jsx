import { createContext, useContext, useEffect, useState } from 'react'
import { loginRequest, registerRequest, fetchMe } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('authToken'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('authUser')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const persistSession = (data) => {
    localStorage.setItem('authToken', data.access_token)
    localStorage.setItem('authUser', JSON.stringify(data.user))
    setToken(data.access_token)
    setUser(data.user)
  }

  const login = async (email, password) => {
    const data = await loginRequest(email, password)
    persistSession(data)
    return data.user
  }

  const register = async (name, email, password, role) => {
    const data = await registerRequest(name, email, password, role)
    persistSession(data)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
