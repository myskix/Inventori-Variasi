import React, { useState, useEffect } from 'react'
import { mockApi } from '../../services/mockApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Receipt, DollarSign, AlertTriangle, TrendingUp, Clock } from 'lucide-react'

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ totalSku: 0, trxsToday: 0, revenueToday: 0, criticalStockCount: 0 })
  const [criticalItems, setCriticalItems] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [products, transactions] = await Promise.all([
        mockApi.getProducts(),
        mockApi.getTransactions()
      ])

      const totalSku = products.length
      const todayStr = new Date().toISOString().slice(0, 10)
      const todayTrxs = transactions.filter((t) => t.date.slice(0, 10) === todayStr)
      const trxsToday = todayTrxs.length
      const revenueToday = todayTrxs.reduce((sum, t) => sum + t.total_amount, 0)
      const critItems = products.filter((p) => p.stok_saat_ini <= p.stok_minimum)

      setMetrics({ totalSku, trxsToday, revenueToday, criticalStockCount: critItems.length })
      setCriticalItems(critItems)
      setRecentTransactions([...transactions].reverse().slice(0, 5))
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDashboardData() }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Memuat dashboard...</div>
  }

  const statCards = [
    { label: 'Total SKU Terdaftar', value: metrics.totalSku, icon: Package, desc: 'Komponen suku cadang & aksesoris' },
    { label: 'Transaksi Hari Ini', value: metrics.trxsToday, icon: Receipt, desc: 'Faktur penjualan kasir hari ini' },
    { label: 'Omset Hari Ini', value: `Rp${metrics.revenueToday.toLocaleString('id-ID')}`, icon: DollarSign, desc: 'Akumulasi penjualan kotor' },
    { label: 'Stok Kritis', value: metrics.criticalStockCount, icon: AlertTriangle, desc: 'Barang di bawah batas minimum', destructive: metrics.criticalStockCount > 0 }
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className={card.destructive ? 'border-destructive/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">{card.label}</CardDescription>
              <card.icon className={`size-4 ${card.destructive ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.destructive ? 'text-destructive' : ''}`}>{card.value}</div>
              <p className="mt-1 text-[11px] text-muted-foreground">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lower Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Critical Stock */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="size-4 text-destructive" /> Peringatan Stok Menipis
              </CardTitle>
              <Badge variant="destructive">{criticalItems.length} SKU</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {criticalItems.length === 0 ? (
              <p className="py-8 text-center text-sm italic text-muted-foreground">Semua stok aman!</p>
            ) : (
              <div className="space-y-2">
                {criticalItems.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{p.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-destructive">{p.stok_saat_ini} pcs</p>
                      <p className="text-[10px] text-muted-foreground">Min: {p.stok_minimum}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-4 text-muted-foreground" /> Penjualan Terbaru
              </CardTitle>
              <Badge variant="secondary">5 Terakhir</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="py-8 text-center text-sm italic text-muted-foreground">Belum ada transaksi.</p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                    <div>
                      <p className="text-sm font-semibold">{t.invoice_no}</p>
                      <p className="text-[11px] text-muted-foreground">{t.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">Rp{t.total_amount.toLocaleString('id-ID')}</p>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                        <Clock className="size-3" />
                        {new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        <span>• {t.payment_method}</span>
                      </div>
                    </div>
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
