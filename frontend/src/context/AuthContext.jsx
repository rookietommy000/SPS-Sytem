import { createContext, useContext, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const DEV_USER = import.meta.env.DEV
    ? { id: 'dev-user', username: 'admin', fullName: '開發模式', role: { name: 'admin' } }
    : null

  const [user, setUser] = useState(() => {
    if (DEV_USER) return DEV_USER
    try { return JSON.parse(localStorage.getItem('sps_user')) } catch { return null }
  })

  async function login(username, password) {
    const res = await api.post('/auth/login', { username, password })
    localStorage.setItem('sps_token', res.data.token)
    localStorage.setItem('sps_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  function logout() {
    localStorage.removeItem('sps_token')
    localStorage.removeItem('sps_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
