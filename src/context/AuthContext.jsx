import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from API
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const res = await api.getProfile()
          setUser(res.user)
        }
      } catch (error) {
        console.error('Failed to parse user session:', error)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  // Login
  const login = async (username, password) => {
    try {
      const res = await api.login(username, password)
      localStorage.setItem('token', res.token)
      setUser(res.user)
      return res.user
    } catch (error) {
      throw error
    }
  }

  // Logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }

  // RBAC Helpers
  const isAdmin = user?.role === 'Admin'
  const isKasir = user?.role === 'Kasir'

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isKasir
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
