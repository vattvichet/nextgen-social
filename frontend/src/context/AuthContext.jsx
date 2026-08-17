import { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    client
      .get('/me')
      .then((res) => {
        setUser(res.data.data)
        localStorage.setItem('user', JSON.stringify(res.data.data))
      })
      .catch(() => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function persistSession(data) {
    setUser(data.user)
    setToken(data.access_token)
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  async function register(payload) {
    const res = await client.post('/register', payload)
    persistSession(res.data)
  }

  async function login(payload) {
    const res = await client.post('/login', payload)
    if (res.data.status === '2fa_required') {
      return { twoFactorRequired: true, pendingToken: res.data.pending_token }
    }
    persistSession(res.data)
    return { twoFactorRequired: false }
  }

  async function verifyLoginOtp(pendingToken, otp_code) {
    const res = await client.post('/login/verify-otp', { pending_token: pendingToken, otp_code })
    persistSession(res.data)
  }

  async function verifyLoginRecovery(pendingToken, recovery_code) {
    const res = await client.post('/login/verify-recovery', { pending_token: pendingToken, recovery_code })
    persistSession(res.data)
  }

  function updateUser(updatedUser) {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  async function logout() {
    try {
      await client.post('/logout')
    } catch {
      // ignore network errors on logout, clear local state regardless
    }
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, register, login, verifyLoginOtp, verifyLoginRecovery, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
