import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { mockApi } from '../../services/mockApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, RefreshCw, Pencil, AlertTriangle, AlertCircle, CheckCircle, Package } from 'lucide-react'

export default function InventoryMaster() {
  const { isAdmin } = useAuth()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [selectedProductForUpdate, setSelectedProductForUpdate] = useState(null)

  const [newProduct, setNewProduct] = useState({
    code: '', name: '', category_id: '', stok_saat_ini: '', stok_minimum: '',
    harga_beli: '', harga_jual: '', warranty_months: '', deskripsi: ''
  })

  const [stockAdjustment, setStockAdjustment] = useState({
    productId: '', operation: 'In', qty: '', remarks: 'Pasokan Restock Baru via Admin'
  })

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [prodList, catList] = await Promise.all([
        mockApi.getProducts(), mockApi.getCategories()
      ])
      setProducts(prodList)
      setCategories(catList)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleAddProductSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    setError(null)
    setActionLoading(true)
    try {
      if (!newProduct.category_id) throw new Error('Pilih Kategori produk!')
      if (products.some((p) => p.code.toLowerCase() === newProduct.code.toLowerCase().trim())) {
        throw new Error('Kode SKU ini sudah digunakan oleh produk lain!')
      }
      await mockApi.addProduct({
        code: newProduct.code.trim().toUpperCase(), name: newProduct.name.trim(),
        category_id: newProduct.category_id,
        stok_saat_ini: Number(newProduct.stok_saat_ini) || 0, stok_minimum: Number(newProduct.stok_minimum) || 0,
        harga_beli: Number(newProduct.harga_beli) || 0, harga_jual: Number(newProduct.harga_jual) || 0,
        warranty_months: Number(newProduct.warranty_months) || 0, deskripsi: newProduct.deskripsi.trim()
      })
      setSuccess('Produk baru berhasil ditambahkan!')
      setIsAddOpen(false)
      setNewProduct({ code: '', name: '', category_id: '', stok_saat_ini: '', stok_minimum: '', harga_beli: '', harga_jual: '', warranty_months: '', deskripsi: '' })
      await loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) { setError(err.message) }
    finally { setActionLoading(false) }
  }

  const handleStockAdjustmentSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    setError(null)
    setActionLoading(true)
    const pId = stockAdjustment.productId || selectedProductForUpdate?.id
    const qtyInput = Number(stockAdjustment.qty)
    try {
      if (!pId) throw new Error('Pilih produk yang akan disesuaikan!')
      if (qtyInput <= 0) throw new Error('Kuantitas harus lebih dari 0!')
      const changeQty = stockAdjustment.operation === 'In' ? qtyInput : -qtyInput
      const logType = stockAdjustment.operation === 'In' ? 'In' : 'Out'
      const remarksText = stockAdjustment.remarks.trim() || (stockAdjustment.operation === 'In' ? 'Pasokan baru via Admin' : 'Penyesuaian stok keluar manual')
      await mockApi.updateProductStock(pId, changeQty, logType, remarksText)
      setSuccess('Stok produk berhasil diperbarui!')
      setIsUpdateOpen(false)
      setSelectedProductForUpdate(null)
      setStockAdjustment({ productId: '', operation: 'In', qty: '', remarks: 'Pasokan Restock Baru via Admin' })
      await loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) { setError(err.message) }
    finally { setActionLoading(false) }
  }

  const getCategoryName = (catId) => categories.find((c) => c.id === catId)?.name || 'Unknown'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Lihat daftar barang variasi, sisa stok, dan modifikasi kuantitas inventori.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Dialog open={isAddOpen} onOpenChange={(o) => { setIsAddOpen(o); if (o) setError(null) }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="size-4" /> Tambah Produk</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Master Produk Baru</DialogTitle>
                  <DialogDescription>Isi data lengkap produk baru untuk ditambahkan ke katalog inventori.</DialogDescription>
                </DialogHeader>
                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" /> <span>{error}</span>
                  </div>
                )}
                <form onSubmit={handleAddProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>SKU Code</Label>
                      <Input required placeholder="PRD-XXXX-XXX" value={newProduct.code} onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })} className="uppercase" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nama Produk</Label>
                      <Input required placeholder="Nama barang" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <select required value={newProduct.category_id} onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option value="" className="bg-background text-foreground">-- Pilih Kategori --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id} className="bg-background text-foreground">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Garansi (Bulan)</Label>
                      <Input type="number" min="0" placeholder="Cth: 3" value={newProduct.warranty_months} onChange={(e) => setNewProduct({ ...newProduct, warranty_months: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Stok Awal</Label>
                      <Input type="number" required min="0" placeholder="Jumlah stok" value={newProduct.stok_saat_ini} onChange={(e) => setNewProduct({ ...newProduct, stok_saat_ini: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Batas Stok Minimum</Label>
                      <Input type="number" required min="0" placeholder="Batas peringatan" value={newProduct.stok_minimum} onChange={(e) => setNewProduct({ ...newProduct, stok_minimum: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Harga Beli (Modal)</Label>
                      <Input type="number" required min="0" placeholder="Rp" value={newProduct.harga_beli} onChange={(e) => setNewProduct({ ...newProduct, harga_beli: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Harga Jual</Label>
                      <Input type="number" required min="0" placeholder="Rp" value={newProduct.harga_jual} onChange={(e) => setNewProduct({ ...newProduct, harga_jual: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Deskripsi Produk</Label>
                    <textarea placeholder="Keterangan singkat..." rows="2" value={newProduct.deskripsi} onChange={(e) => setNewProduct({ ...newProduct, deskripsi: e.target.value })} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
                    <Button type="submit" disabled={actionLoading}>{actionLoading ? 'Menyimpan...' : 'Simpan Produk'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isUpdateOpen} onOpenChange={(o) => { setIsUpdateOpen(o); if (o) { setError(null); setSelectedProductForUpdate(null) } }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><RefreshCw className="size-4" /> Penyesuaian Stok</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Penyesuaian Mutasi Stok</DialogTitle>
                  <DialogDescription>
                    {selectedProductForUpdate
                      ? `Produk: ${selectedProductForUpdate.name} (${selectedProductForUpdate.code}) • Stok Saat Ini: ${selectedProductForUpdate.stok_saat_ini} pcs`
                      : 'Ubah jumlah stok barang secara manual.'}
                  </DialogDescription>
                </DialogHeader>
                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" /> <span>{error}</span>
                  </div>
                )}
                <form onSubmit={handleStockAdjustmentSubmit} className="space-y-4">
                  {!selectedProductForUpdate && (
                    <div className="space-y-2">
                      <Label>Pilih Produk</Label>
                      <select required value={stockAdjustment.productId} onChange={(e) => setStockAdjustment({ ...stockAdjustment, productId: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option value="" className="bg-background text-foreground">-- Pilih Produk --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id} className="bg-background text-foreground">
                            {p.name} ({p.code}) • Stok: {p.stok_saat_ini} pcs
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Aksi Stok</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" variant={stockAdjustment.operation === 'In' ? 'default' : 'outline'} onClick={() => setStockAdjustment({ ...stockAdjustment, operation: 'In' })}>
                        Tambah Stok (Masuk)
                      </Button>
                      <Button type="button" variant={stockAdjustment.operation === 'Out' ? 'default' : 'outline'} onClick={() => setStockAdjustment({ ...stockAdjustment, operation: 'Out' })}>
                        Kurangi Stok (Keluar)
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Kuantitas (Pcs)</Label>
                    <Input type="number" required min="1" placeholder="Jumlah pcs" value={stockAdjustment.qty} onChange={(e) => setStockAdjustment({ ...stockAdjustment, qty: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Keterangan Mutasi</Label>
                    <Input required placeholder="Cth: Koreksi opname bulanan" value={stockAdjustment.remarks} onChange={(e) => setStockAdjustment({ ...stockAdjustment, remarks: e.target.value })} />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => { setIsUpdateOpen(false); setSelectedProductForUpdate(null) }}>Batal</Button>
                    <Button type="submit" disabled={actionLoading}>{actionLoading ? 'Memproses...' : 'Proses Mutasi'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Success Alert */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">
          <CheckCircle className="size-4 shrink-0" /> <span>{success}</span>
        </div>
      )}

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Memuat data master stok...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU & Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Harga Beli</TableHead>
                    <TableHead className="text-right">Harga Jual</TableHead>
                    <TableHead className="text-center">Stok</TableHead>
                    {isAdmin && <TableHead className="text-center">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const isLow = p.stok_saat_ini <= p.stok_minimum
                    return (
                      <TableRow key={p.id} className={isLow ? 'bg-destructive/5' : ''}>
                        <TableCell>
                          <div className="font-semibold">{p.name}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">{p.code}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{getCategoryName(p.category_id)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">Rp{p.harga_beli.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right font-medium">Rp{p.harga_jual.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-bold ${isLow ? 'text-destructive' : ''}`}>{p.stok_saat_ini} pcs</span>
                            {isLow && <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="mr-1 size-3" />Stok Menipis</Badge>}
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-center">
                            <Button variant="outline" size="xs" onClick={() => {
                              setError(null)
                              setSelectedProductForUpdate(p)
                              setStockAdjustment((prev) => ({ ...prev, productId: p.id }))
                              setIsUpdateOpen(true)
                            }}>
                              <Pencil className="size-3" /> Edit Stok
                            </Button>
                          </TableCell>
                        )}
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
