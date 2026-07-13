import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingCart,
  ShieldCheck,
  LogOut,
  X,
  Wrench,
  Tags,
  PenTool,
  FileClock,
  Banknote,
  Truck,
  History,
  FileText
} from 'lucide-react'

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/inventori', label: 'Master Produk', icon: Package },
  { to: '/admin/kategori', label: 'Master Kategori', icon: Tags },
  { to: '/admin/logs', label: 'Stock Logs', icon: FileText }
]

const kasirLinks = [
  { to: '/kasir/pos', label: 'Terminal POS', icon: ShoppingCart },
  { to: '/kasir/garansi', label: 'Cek Garansi', icon: ShieldCheck }
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const NavLink = ({ to, label, icon: Icon }) => (
    <Link
      to={to}
      onClick={onClose}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive(to)
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </Link>
  )

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Wrench className="size-4 text-primary-foreground" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-bold text-sidebar-foreground">POS Variasi</p>
              <p className="text-[10px] font-medium text-muted-foreground">Pekanbaru</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {isAdmin && (
            <>
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Admin
              </p>
              {adminLinks.map((link) => (
                <NavLink key={link.to} {...link} />
              ))}
              <Separator className="my-3" />
            </>
          )}

          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Kasir
          </p>
          {kasirLinks.map((link) => (
            <NavLink key={link.to} {...link} />
          ))}
        </nav>

        {/* User Footer */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground">{user?.role}</p>
            </div>
            <button
              onClick={() => { logout(); onClose(); }}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Keluar"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
