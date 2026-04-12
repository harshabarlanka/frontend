import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMeAPI, loginAPI, registerAPI, logoutAPI } from '../api/auth.api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Bootstrap: load user from stored tokens on mount ──────────────────────
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) { setLoading(false); return }
      try {
        const { data } = await getMeAPI()
        setUser(data.data.user)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await loginAPI(credentials)
    const { user: userData, accessToken, refreshToken } = data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (formData) => {
    const { data } = await registerAPI(formData)
    const { user: userData, accessToken, refreshToken } = data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try { await logoutAPI() } catch { /* ignore */ }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }))
  }, [])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
