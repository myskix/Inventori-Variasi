import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Target, Package } from 'lucide-react'

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    omsetToday: 0,
    omsetMonth: 0,
    omsetYear: 0,
    totalProfit: 0
  })
  
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const data = await api.getDashboardMetrics()
      setMetrics(data.metrics || { omsetToday: 0, omsetMonth: 0, omsetYear: 0, totalProfit: 0 })
      setTopProducts(data.topProducts || [])
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDashboardData() }, [])

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Memuat Analytics Dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard & Analytics</h2>
        <p className="text-sm text-muted-foreground">Ringkasan performa penjualan dan finansial toko.</p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Omset Hari Ini</CardDescription>
            <DollarSign className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp{metrics.omsetToday.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Omset Bulan Ini</CardDescription>
            <TrendingUp className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Rp{metrics.omsetMonth.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Omset Tahun Ini</CardDescription>
            <Target className="size-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">Rp{metrics.omsetYear.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Profit Bersih</CardDescription>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp{metrics.totalProfit.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Package className="size-4 text-orange-500" /> Top 5 Produk Terlaris
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground mt-4">Belum ada data penjualan produk.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <span className="text-sm font-medium truncate pr-4">{p.name}</span>
                    <Badge variant="secondary">{p.qty} Terjual</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
