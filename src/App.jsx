import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ProtectedRoute, AdminRoute } from './routes'

// Layout components
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

// Views
import Login from './views/Login'
import POSCheckout from './views/kasir/POSCheckout'
import WarrantyTracker from './views/kasir/WarrantyTracker'
import Dashboard from './views/admin/Dashboard'
import InventoryMaster from './views/admin/InventoryMaster'
import StockLogs from './views/admin/StockLogs'

// Authenticated Layout Shell: Sidebar + Navbar + Content
function LayoutShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { user, isAdmin } = useAuth()

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/kasir/pos" replace />
          )
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          user ? (
            isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/kasir/pos" replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Kasir Routes */}
      <Route path="/kasir/pos" element={<ProtectedRoute><LayoutShell><POSCheckout /></LayoutShell></ProtectedRoute>} />
      <Route path="/kasir/garansi" element={<ProtectedRoute><LayoutShell><WarrantyTracker /></LayoutShell></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminRoute><LayoutShell><Dashboard /></LayoutShell></AdminRoute>} />
      <Route path="/admin/inventori" element={<AdminRoute><LayoutShell><InventoryMaster /></LayoutShell></AdminRoute>} />
      <Route path="/admin/logs" element={<AdminRoute><LayoutShell><StockLogs /></LayoutShell></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
