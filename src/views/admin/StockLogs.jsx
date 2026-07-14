import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, ArrowDownCircle, ArrowUpCircle, DollarSign, Settings, Inbox } from 'lucide-react'

export default function StockLogs() {
  const [logs, setLogs] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [logList, prodList] = await Promise.all([
        api.getStockLogs(), api.getProducts()
      ])
      setLogs([...logList].reverse())
      setProducts(prodList)
    } catch (err) { console.error('Failed to load stock logs:', err) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const getProductDetails = (prodId) => products.find((p) => p.id === prodId) || { name: 'Produk Terhapus', code: 'N/A' }

  const filteredLogs = logs.filter((log) => {
    const prod = getProductDetails(log.product_id)
    const matchSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) || prod.code.toLowerCase().includes(searchTerm.toLowerCase().trim())
    const matchType = typeFilter === 'All' || log.type === typeFilter
    
    let matchDate = true
    const logDate = new Date(log.date).setHours(0, 0, 0, 0)
    if (startDate) {
      matchDate = matchDate && logDate >= new Date(startDate).setHours(0, 0, 0, 0)
    }
    if (endDate) {
      matchDate = matchDate && logDate <= new Date(endDate).setHours(0, 0, 0, 0)
    }

    return matchSearch && matchType && matchDate
  })

  const renderTypeBadge = (type) => {
    switch (type) {
      case 'In':
        return <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20"><ArrowDownCircle className="size-3" />Masuk</Badge>
      case 'Out':
        return <Badge variant="secondary" className="gap-1 bg-destructive/10 text-destructive border-destructive/20"><ArrowUpCircle className="size-3" />Keluar</Badge>
      case 'Sale':
        return <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-500 border-blue-500/20"><DollarSign className="size-3" />Penjualan</Badge>
      case 'Adjustment':
        return <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20"><Settings className="size-3" />Opname</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Description */}
      <p className="text-sm text-muted-foreground">Riwayat kronologis keluar-masuk stok barang, mutasi penjualan kasir, dan penyesuaian opname admin.</p>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        <div className="relative sm:col-span-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari SKU atau produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="sm:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="All">Semua Mutasi</option>
            <option value="In">Masuk (In)</option>
            <option value="Out">Keluar (Out)</option>
            <option value="Sale">Penjualan (Sale)</option>
            <option value="Adjustment">Opname</option>
          </select>
        </div>
        <div className="sm:col-span-5 flex items-center gap-2">
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 w-full text-sm"
          />
          <span className="text-muted-foreground text-sm">s/d</span>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 w-full text-sm"
          />
        </div>
      </div>

      {/* Stock Log Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Memuat jurnal mutasi...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <Inbox className="size-8" />
              <span className="text-sm font-semibold">Jurnal mutasi kosong</span>
              <span className="text-xs">Belum ada data pergerakan stok yang cocok dengan filter Anda.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Produk & SKU</TableHead>
                    <TableHead className="text-center">Mutasi</TableHead>
                    <TableHead className="text-center">Perubahan Qty</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const prod = getProductDetails(log.product_id)
                    const isNegative = log.change_qty < 0
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="font-medium">{new Date(log.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</div>
                          <div className="text-[11px] text-muted-foreground">{new Date(log.date).toLocaleTimeString('id-ID', { timeStyle: 'short' })}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{prod.name}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">{prod.code}</div>
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">{renderTypeBadge(log.type)}</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-mono text-sm font-bold ${isNegative ? 'text-destructive' : 'text-green-500'}`}>
                            {isNegative ? '' : '+'}{log.change_qty} pcs
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{log.remarks}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
