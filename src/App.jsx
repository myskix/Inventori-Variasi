import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ProtectedRoute, AdminRoute } from './routes'

// Layout components
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

import { Suspense, lazy } from 'react'

// Views (Lazy Loaded)
const Login = lazy(() => import('./views/Login'))
const POSCheckout = lazy(() => import('./views/kasir/POSCheckout'))
const WarrantyTracker = lazy(() => import('./views/kasir/WarrantyTracker'))
const Dashboard = lazy(() => import('./views/admin/Dashboard'))
const InventoryMaster = lazy(() => import('./views/admin/InventoryMaster'))
const StockLogs = lazy(() => import('./views/admin/StockLogs'))
const CategoryMaster = lazy(() => import('./views/admin/CategoryMaster'))

// Fallback Loader
const PageLoader = () => (
  <div className="flex h-[80vh] items-center justify-center text-sm text-muted-foreground">Memuat halaman...</div>
)

// Authenticated Layout Shell: Sidebar + Navbar + Content
function LayoutShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
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
            <Suspense fallback={<PageLoader />}><Login /></Suspense>
          )
        }
      />

      {/* Kasir Routes */}
      <Route path="/kasir/pos" element={<ProtectedRoute><LayoutShell><POSCheckout /></LayoutShell></ProtectedRoute>} />
      <Route path="/kasir/garansi" element={<ProtectedRoute><LayoutShell><WarrantyTracker /></LayoutShell></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminRoute><LayoutShell><Dashboard /></LayoutShell></AdminRoute>} />
      <Route path="/admin/inventori" element={<AdminRoute><LayoutShell><InventoryMaster /></LayoutShell></AdminRoute>} />
      <Route path="/admin/kategori" element={<AdminRoute><LayoutShell><CategoryMaster /></LayoutShell></AdminRoute>} />
      <Route path="/admin/logs" element={<AdminRoute><LayoutShell><StockLogs /></LayoutShell></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
