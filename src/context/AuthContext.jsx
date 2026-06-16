import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Predefined mock users for POS system
const MOCK_USERS = [
  {
    id: 'usr-001',
    username: 'admin',
    password: 'admin123',
    role: 'Admin',
    name: 'Pak Adi'
  },
  {
    id: 'usr-002',
    username: 'kasir',
    password: 'kasir123',
    role: 'Kasir',
    name: 'Rian'
  }
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('pos_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Failed to parse user session:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Login simulation
  const login = async (username, password) => {
    // Simulate API network latency
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(
          (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        )

        if (foundUser) {
          // Exclude password from stored session
          const { password: _, ...safeUser } = foundUser
          setUser(safeUser)
          localStorage.setItem('pos_user', JSON.stringify(safeUser))
          resolve(safeUser)
        } else {
          reject(new Error('Username atau password salah!'))
        }
      }, 500)
    })
  }

  // Logout simulation
  const logout = () => {
    setUser(null)
    localStorage.removeItem('pos_user')
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
    isKasir,
    users: MOCK_USERS.map(({ password: _, ...safeUser }) => safeUser) // Safe user list if needed
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
