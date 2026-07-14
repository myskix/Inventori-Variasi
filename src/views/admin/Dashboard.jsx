import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Target, Package, CalendarDays, ChevronLeft, ChevronRight, Receipt } from 'lucide-react'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default function Dashboard() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1) // 1-indexed
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [metrics, setMetrics] = useState({
    omsetToday: 0,
    omsetMonth: 0,
    omsetYear: 0,
    totalProfit: 0,
    totalTransactions: 0
  })
  
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const data = await api.getDashboardMetrics({ month: selectedMonth, year: selectedYear })
      setMetrics(data.metrics || { omsetToday: 0, omsetMonth: 0, omsetYear: 0, totalProfit: 0, totalTransactions: 0 })
      setTopProducts(data.topProducts || [])
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDashboardData() }, [selectedMonth, selectedYear])

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(y => y - 1)
    } else {
      setSelectedMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(y => y + 1)
    } else {
      setSelectedMonth(m => m + 1)
    }
  }

  const handleResetToday = () => {
    setSelectedMonth(now.getMonth() + 1)
    setSelectedYear(now.getFullYear())
  }

  const isCurrentMonth = selectedMonth === (now.getMonth() + 1) && selectedYear === now.getFullYear()
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth, 0).getDate()
  const dailyAverage = (metrics.omsetMonth || 0) / daysInSelectedMonth

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard & Analytics</h2>
          <p className="text-sm text-muted-foreground">Ringkasan performa penjualan dan finansial toko.</p>
        </div>

        {/* Month/Year Filter */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} className="size-8">
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm font-semibold min-w-[180px] justify-center">
            <CalendarDays className="size-4 text-muted-foreground" />
            <span>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
          </div>
          <Button variant="outline" size="icon" onClick={handleNextMonth} className="size-8">
            <ChevronRight className="size-4" />
          </Button>
          {!isCurrentMonth && (
            <Button variant="secondary" size="sm" onClick={handleResetToday} className="text-xs">
              Hari Ini
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Memuat Analytics Dashboard...</div>
      ) : (
        <>
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                  {isCurrentMonth ? 'Omset Hari Ini' : 'Rata-rata Harian'}
                </CardDescription>
                <DollarSign className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rp{(isCurrentMonth ? (metrics.omsetToday ?? 0) : dailyAverage).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                  Omset {MONTH_NAMES[selectedMonth - 1]}
                </CardDescription>
                <TrendingUp className="size-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">Rp{(metrics.omsetMonth ?? 0).toLocaleString('id-ID')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">Omset Tahun {selectedYear}</CardDescription>
                <Target className="size-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">Rp{(metrics.omsetYear ?? 0).toLocaleString('id-ID')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                  Profit {MONTH_NAMES[selectedMonth - 1]}
                </CardDescription>
                <DollarSign className="size-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Rp{(metrics.totalProfit ?? 0).toLocaleString('id-ID')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                  Transaksi {MONTH_NAMES[selectedMonth - 1]}
                </CardDescription>
                <Receipt className="size-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{(metrics.totalTransactions ?? 0).toLocaleString('id-ID')}</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Package className="size-4 text-orange-500" /> Top 5 Produk Terlaris — {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topProducts.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground mt-4">Belum ada data penjualan produk untuk bulan ini.</p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">{i + 1}</span>
                          <span className="text-sm font-medium truncate pr-4">{p.name}</span>
                        </div>
                        <Badge variant="secondary">{p.qty} Terjual</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
