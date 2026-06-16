import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Wrench, LogIn, User, Lock, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login, logout } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('Kasir')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const safeUser = await login(username, password)
      if (safeUser.role !== selectedRole) {
        logout()
        throw new Error(`Kredensial benar, tetapi akun ini tidak memiliki hak akses sebagai ${selectedRole}.`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (role) => {
    if (role === 'Admin') {
      setUsername('admin')
      setPassword('admin123')
      setSelectedRole('Admin')
    } else {
      setUsername('kasir')
      setPassword('kasir123')
      setSelectedRole('Kasir')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary">
            <Wrench className="size-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Sistem POS & Inventori</CardTitle>
          <CardDescription>Toko Variasi Motor — Pekanbaru</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="space-y-2">
              <Label>Pilih Role Akses</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Kasir', 'Admin'].map((role) => (
                  <Button
                    key={role}
                    type="button"
                    variant={selectedRole === role ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setSelectedRole(role)}
                  >
                    {role === 'Kasir' ? 'Staf Kasir' : 'Admin (Owner)'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="size-4" />
              {loading ? 'Menghubungkan...' : 'Masuk ke Sistem'}
            </Button>
          </form>

          {/* Quick-fill for testing */}
          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Uji Coba Cepat (Autofill)
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fillCredentials('Kasir')}>
                Kasir
              </Button>
              <Button variant="outline" size="sm" onClick={() => fillCredentials('Admin')}>
                Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
