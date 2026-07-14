import React, { useState, useEffect, useMemo } from 'react'
import { api } from '../../services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Search, Shield, Clock, AlertTriangle, User, Car, Phone, FileText } from 'lucide-react'
import { EmptyState } from '../../components/EmptyState'

export default function WarrantyTracker() {
  const [warranties, setWarranties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedWarranty, setSelectedWarranty] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await api.checkWarranty(search.trim() ? { plat: search.trim(), invoice: search.trim(), name: search.trim() } : {})
      // Urutkan dari yang terbaru
      setWarranties(data.sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date)))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    const debounce = setTimeout(() => {
      loadData()
    }, 500)
    return () => clearTimeout(debounce)
  }, [search])

  // Kalkulasi Status Garansi
  const getWarrantyStatus = (expiryDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exp = new Date(expiryDate)
    exp.setHours(0, 0, 0, 0)
    
    const diffTime = exp - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { label: 'Kedaluwarsa', variant: 'destructive', daysRemaining: diffDays }
    if (diffDays <= 7) return { label: 'Akan Berakhir', variant: 'secondary', className: 'bg-amber-500 text-white hover:bg-amber-600', daysRemaining: diffDays }
    return { label: 'Aktif', variant: 'default', className: 'bg-green-500 hover:bg-green-600', daysRemaining: diffDays }
  }

  const filteredWarranties = useMemo(() => {
    if (!search.trim()) return warranties
    const term = search.toLowerCase()
    return warranties.filter(w => 
      w.customer_plat?.toLowerCase().includes(term) ||
      w.customer_name?.toLowerCase().includes(term) ||
      w.invoice_no?.toLowerCase().includes(term)
    )
  }, [warranties, search])

  const openDetail = (warranty) => {
    setSelectedWarranty(warranty)
    setIsDetailOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Cek Garansi Digital</h2>
          <p className="text-sm text-muted-foreground">Lacak status garansi pelanggan berdasarkan Plat Nomor, Nama, atau Invoice.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Cari Plat Kendaraan, Nama, atau No Invoice..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Memuat data garansi...</div>
          ) : filteredWarranties.length === 0 ? (
            <EmptyState title="Tidak Ditemukan" description="Data garansi tidak ditemukan untuk pencarian ini." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pelanggan & Kendaraan</TableHead>
                    <TableHead>Produk Bergaransi</TableHead>
                    <TableHead>Periode Garansi</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWarranties.map((w) => {
                    const status = getWarrantyStatus(w.expiry_date)
                    return (
                      <TableRow key={w.id}>
                        <TableCell>
                          <div className="font-semibold uppercase">{w.customer_plat !== '-' ? w.customer_plat : 'TANPA PLAT'}</div>
                          <div className="text-xs text-muted-foreground">{w.customer_name} • {w.customer_phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{w.product_name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">{w.invoice_no}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{w.duration_days} Hari</div>
                          <div className="text-[11px] text-muted-foreground">s/d {new Date(w.expiry_date).toLocaleDateString('id-ID')}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={status.variant} className={status.className}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(w)}>
                            <FileText className="mr-1 size-3" /> Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-5 text-primary" /> Detail Garansi Digital
            </DialogTitle>
            <DialogDescription>
              Riwayat dan informasi klaim garansi transaksi.
            </DialogDescription>
          </DialogHeader>
          
          {selectedWarranty && (() => {
            const status = getWarrantyStatus(selectedWarranty.expiry_date)
            return (
              <div className="space-y-4">
                {/* Status Banner */}
                <div className={`flex items-center justify-between rounded-lg border p-3 ${
                  status.variant === 'destructive' ? 'bg-destructive/10 border-destructive/20 text-destructive' :
                  status.label === 'Akan Berakhir' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
                  'bg-green-500/10 border-green-500/20 text-green-600'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {status.variant === 'destructive' ? <AlertTriangle className="size-4" /> : <Clock className="size-4" />}
                    {status.label}
                  </div>
                  <span className="text-sm font-semibold">
                    {status.daysRemaining < 0 
                      ? `Lewat ${Math.abs(status.daysRemaining)} hari` 
                      : `Sisa ${status.daysRemaining} hari`}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground"><User className="size-3" /> Pelanggan</span>
                    <p className="font-semibold">{selectedWarranty.customer_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground"><Phone className="size-3" /> WhatsApp</span>
                    <p className="font-medium">{selectedWarranty.customer_phone}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground"><Car className="size-3" /> Kendaraan</span>
                    <p className="font-bold uppercase">{selectedWarranty.customer_plat}</p>
                    {selectedWarranty.customer_vehicle && selectedWarranty.customer_vehicle !== '-' && (
                      <p className="text-xs text-muted-foreground">{selectedWarranty.customer_vehicle}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground"><FileText className="size-3" /> No Invoice</span>
                    <p className="font-mono font-medium">{selectedWarranty.invoice_no}</p>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <span className="text-[10px] uppercase text-muted-foreground">Produk Dilindungi</span>
                  <p className="font-semibold">{selectedWarranty.product_name}</p>
                  <div className="mt-2 flex justify-between text-xs">
                    <span>Masa Garansi: <b className="font-mono">{selectedWarranty.duration_days} Hari</b></span>
                    <span>Tgl Beli: <b>{new Date(selectedWarranty.issue_date).toLocaleDateString('id-ID')}</b></span>
                  </div>
                </div>

                {selectedWarranty.customer_notes && selectedWarranty.customer_notes !== '-' && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase text-muted-foreground">Catatan Transaksi</span>
                    <p className="text-sm italic text-muted-foreground">"{selectedWarranty.customer_notes}"</p>
                  </div>
                )}
              </div>
            )
          })()}
          
          <DialogFooter>
            <Button onClick={() => setIsDetailOpen(false)} className="w-full">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
