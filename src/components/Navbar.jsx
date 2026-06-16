import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu } from 'lucide-react'

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/inventori': 'Master Stok Suku Cadang',
  '/admin/logs': 'Jurnal Mutasi Barang',
  '/kasir/pos': 'Terminal Kasir (POS)',
  '/kasir/garansi': 'Pelacakan Garansi Digital'
}

export default function Navbar({ onMenuToggle }) {
  const { user, isAdmin } = useAuth()
  const location = useLocation()

  const title = pageTitles[location.pathname] || 'POS Variasi'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
      </div>

      {/* User meta (desktop) */}
      <div className="hidden items-center gap-3 sm:flex">
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{user?.name}</p>
          <p className="text-[10px] text-muted-foreground">{user?.role}</p>
        </div>
        <div className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
          isAdmin
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        }`}>
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  )
}
