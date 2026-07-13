import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, RefreshCw, Pencil, AlertTriangle, Trash2, Search, RotateCcw, ShieldAlert } from 'lucide-react'
import { EmptyState } from '../../components/EmptyState'
import { Pagination } from '../../components/ui/pagination'
import { useToast } from '../../components/ui/toast'

export default function InventoryMaster() {
  const { isAdmin, user } = useAuth()
  const { toast } = useToast()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState(null)

  const defaultProductForm = {
    code: '', name: '', category_id: '', stok_saat_ini: '', stok_minimum: '',
    harga_beli: '', harga_jual: '', warranty_months: '', deskripsi: '', is_active: true
  }
  const [productForm, setProductForm] = useState(defaultProductForm)

  const [stockAdjustment, setStockAdjustment] = useState({
    productId: '', operation: 'In', qty: '', remarks: 'Pasokan Restock Baru via Admin'
  })

  const [actionLoading, setActionLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [prodList, catList] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ])
      setProducts(prodList)
      setCategories(catList)
    } catch (err) { 
      toast({ title: 'Gagal memuat data', description: err.message, variant: 'destructive' })
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { loadData() }, [])

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()))
  }, [products, search])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  }, [filteredProducts, page])

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    setActionLoading(true)
    try {
      if (!productForm.category_id) throw new Error('Pilih Kategori produk!')
      await api.createProduct({
        code: productForm.code,
        name: productForm.name,
        description: productForm.deskripsi,
        category_id: Number(productForm.category_id),
        harga_modal: Number(productForm.harga_beli),
        harga_jual: Number(productForm.harga_jual),
        stok_minimum: Number(productForm.stok_minimum),
        stok_saat_ini: Number(productForm.stok_saat_ini),
        is_active: productForm.is_active
      })
      toast({ title: 'Berhasil', description: 'Produk baru berhasil ditambahkan.' })
      setIsAddOpen(false)
      setProductForm(defaultProductForm)
      loadData()
    } catch (err) { 
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' }) 
    } finally { 
      setActionLoading(false) 
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    setActionLoading(true)
    try {
      await api.updateProduct(selectedProduct.id, productForm)
      toast({ title: 'Berhasil', description: 'Data produk berhasil diperbarui.' })
      setIsEditOpen(false)
      loadData()
    } catch (err) { 
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' }) 
    } finally { 
      setActionLoading(false) 
    }
  }

  const handleDeleteSubmit = async () => {
    if (!isAdmin) return
    setActionLoading(true)
    try {
      await api.deleteProduct(selectedProduct.id)
      toast({ title: 'Berhasil', description: 'Produk berhasil dihapus.' })
      setIsDeleteOpen(false)
      loadData()
    } catch (err) { 
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' }) 
    } finally { 
      setActionLoading(false) 
    }
  }

  const handleRestore = async (id) => {
    if (!isAdmin) return
    try {
      await api.restoreProduct(id)
      toast({ title: 'Berhasil', description: 'Produk berhasil direstore.' })
      loadData()
    } catch (err) {
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' }) 
    }
  }

  const handleStockAdjustmentSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    setActionLoading(true)
    const pId = stockAdjustment.productId || selectedProduct?.id
    const qtyInput = Number(stockAdjustment.qty)
    try {
      if (!pId) throw new Error('Pilih produk yang akan disesuaikan!')
      if (qtyInput <= 0) throw new Error('Kuantitas harus lebih dari 0!')
      const changeQty = stockAdjustment.operation === 'In' ? qtyInput : -qtyInput
      const logType = stockAdjustment.operation === 'In' ? 'Adjustment' : 'Adjustment'
      const remarksText = stockAdjustment.remarks.trim() || (stockAdjustment.operation === 'In' ? 'Pasokan baru via Admin' : 'Penyesuaian stok keluar manual')
      
      await api.updateProductStock(pId, changeQty, logType, remarksText)
      
      toast({ title: 'Berhasil', description: 'Stok produk berhasil disesuaikan.' })
      setIsUpdateStockOpen(false)
      setSelectedProduct(null)
      setStockAdjustment({ productId: '', operation: 'In', qty: '', remarks: 'Pasokan Restock Baru via Admin' })
      loadData()
    } catch (err) { 
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' }) 
    } finally { 
      setActionLoading(false) 
    }
  }

  const getCategoryName = (catId) => categories.find((c) => c.id === catId)?.name || 'Unknown'

  const openAdd = () => {
    setProductForm(defaultProductForm)
    setIsAddOpen(true)
  }

  const openEdit = (p) => {
    setSelectedProduct(p)
    setProductForm({
      code: p.code, name: p.name, category_id: p.category_id, 
      stok_saat_ini: p.stok_saat_ini, stok_minimum: p.stok_minimum,
      harga_beli: p.harga_beli, harga_jual: p.harga_jual, 
      warranty_months: p.warranty_months, deskripsi: p.deskripsi, is_active: p.is_active
    })
    setIsEditOpen(true)
  }

  const openStockUpdate = (p) => {
    setSelectedProduct(p)
    setStockAdjustment((prev) => ({ ...prev, productId: p.id, operation: 'In', qty: '', remarks: 'Penyesuaian stok' }))
    setIsUpdateStockOpen(true)
  }

  const openDelete = (p) => {
    setSelectedProduct(p)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Master Produk & Inventori</h2>
          <p className="text-sm text-muted-foreground">Lihat daftar barang, penyesuaian stok, dan manajemen data produk.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button size="sm" onClick={openAdd}><Plus className="size-4" /> Tambah Produk</Button>
            <Button variant="outline" size="sm" onClick={() => { setSelectedProduct(null); setIsUpdateStockOpen(true); }}><RefreshCw className="size-4" /> Mutasi Stok</Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Cari berdasarkan SKU atau nama produk..." 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Memuat data master stok...</div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState title="Produk Kosong" description="Belum ada produk yang ditambahkan atau tidak ada yang cocok dengan pencarian." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU & Produk</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Harga Beli</TableHead>
                      <TableHead className="text-right">Harga Jual</TableHead>
                      <TableHead className="text-center">Stok</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      {isAdmin && <TableHead className="text-center">Aksi</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((p) => {
                      const isLow = p.stok_saat_ini <= p.stok_minimum
                      const isDeleted = p.is_deleted
                      return (
                        <TableRow key={p.id} className={`${isLow && !isDeleted ? 'bg-destructive/5' : ''} ${isDeleted ? 'opacity-50 bg-muted/30' : ''}`}>
                          <TableCell>
                            <div className="font-semibold">{p.name}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">{p.code}</div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{getCategoryName(p.category_id)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">Rp{p.harga_beli.toLocaleString('id-ID')}</TableCell>
                          <TableCell className="text-right font-medium">Rp{p.harga_jual.toLocaleString('id-ID')}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`font-bold ${isLow && !isDeleted ? 'text-destructive' : ''}`}>{p.stok_saat_ini} pcs</span>
                              {isLow && !isDeleted && <Badge variant="destructive" className="text-[10px] px-1 py-0"><AlertTriangle className="mr-1 size-3" />Tipis</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {isDeleted ? (
                              <Badge variant="destructive">Terhapus</Badge>
                            ) : (
                              <Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                            )}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-1">
                                {isDeleted ? (
                                  <Button variant="outline" size="xs" onClick={() => handleRestore(p.id)}>
                                    <RotateCcw className="size-3" /> Restore
                                  </Button>
                                ) : (
                                  <>
                                    <Button variant="ghost" size="icon" className="size-7" onClick={() => openStockUpdate(p)} title="Penyesuaian Stok">
                                      <RefreshCw className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(p)} title="Edit Produk">
                                      <Pencil className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => openDelete(p)} title="Hapus Produk">
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="py-4">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Master Produk Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>SKU Code</Label>
                <Input required placeholder="PRD-XXXX-XXX" value={productForm.code} onChange={(e) => setProductForm({ ...productForm, code: e.target.value })} className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label>Nama Produk</Label>
                <Input required placeholder="Nama barang" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <select required value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="" className="bg-background text-foreground">-- Pilih Kategori --</option>
                  {categories.filter(c => !c.is_deleted && c.is_active).map((c) => (<option key={c.id} value={c.id} className="bg-background text-foreground">{c.name}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Garansi (Bulan)</Label>
                <Input type="number" min="0" placeholder="Cth: 3" value={productForm.warranty_months} onChange={(e) => setProductForm({ ...productForm, warranty_months: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Stok Awal</Label>
                <Input type="number" required min="0" placeholder="Jumlah stok" value={productForm.stok_saat_ini} onChange={(e) => setProductForm({ ...productForm, stok_saat_ini: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Batas Stok Minimum</Label>
                <Input type="number" required min="0" placeholder="Batas peringatan" value={productForm.stok_minimum} onChange={(e) => setProductForm({ ...productForm, stok_minimum: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Harga Beli (Modal)</Label>
                <Input type="number" required min="0" placeholder="Rp" value={productForm.harga_beli} onChange={(e) => setProductForm({ ...productForm, harga_beli: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Harga Jual</Label>
                <Input type="number" required min="0" placeholder="Rp" value={productForm.harga_jual} onChange={(e) => setProductForm({ ...productForm, harga_jual: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Produk</Label>
              <textarea placeholder="Keterangan singkat..." rows="2" value={productForm.deskripsi} onChange={(e) => setProductForm({ ...productForm, deskripsi: e.target.value })} className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
              <Button type="submit" disabled={actionLoading}>{actionLoading ? 'Menyimpan...' : 'Simpan Produk'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>SKU Code</Label>
                <Input required placeholder="PRD-XXXX-XXX" value={productForm.code} onChange={(e) => setProductForm({ ...productForm, code: e.target.value })} className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label>Nama Produk</Label>
                <Input required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <select required value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="" className="bg-background text-foreground">-- Pilih Kategori --</option>
                  {categories.filter(c => !c.is_deleted).map((c) => (<option key={c.id} value={c.id} className="bg-background text-foreground">{c.name}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Garansi (Bulan)</Label>
                <Input type="number" min="0" value={productForm.warranty_months} onChange={(e) => setProductForm({ ...productForm, warranty_months: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Harga Beli (Modal)</Label>
                <Input type="number" required min="0" value={productForm.harga_beli} onChange={(e) => setProductForm({ ...productForm, harga_beli: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Harga Jual</Label>
                <Input type="number" required min="0" value={productForm.harga_jual} onChange={(e) => setProductForm({ ...productForm, harga_jual: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Batas Stok Minimum</Label>
                <Input type="number" required min="0" value={productForm.stok_minimum} onChange={(e) => setProductForm({ ...productForm, stok_minimum: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select 
                  value={productForm.is_active ? 'true' : 'false'} 
                  onChange={(e) => setProductForm({ ...productForm, is_active: e.target.value === 'true' })}
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="true" className="bg-background text-foreground">Aktif</option>
                  <option value="false" className="bg-background text-foreground">Nonaktif</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Produk</Label>
              <textarea rows="2" value={productForm.deskripsi} onChange={(e) => setProductForm({ ...productForm, deskripsi: e.target.value })} className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
              <Button type="submit" disabled={actionLoading}>{actionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isUpdateStockOpen} onOpenChange={(o) => { setIsUpdateStockOpen(o); if (!o) setSelectedProduct(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Penyesuaian Mutasi Stok</DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? `Produk: ${selectedProduct.name} (${selectedProduct.code}) • Stok: ${selectedProduct.stok_saat_ini} pcs`
                : 'Pilih produk dan ubah jumlah stok secara manual.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockAdjustmentSubmit} className="space-y-4">
            {!selectedProduct && (
              <div className="space-y-2">
                <Label>Pilih Produk</Label>
                <select required value={stockAdjustment.productId} onChange={(e) => setStockAdjustment({ ...stockAdjustment, productId: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="" className="bg-background text-foreground">-- Pilih Produk --</option>
                  {products.filter(p => !p.is_deleted).map((p) => (<option key={p.id} value={p.id} className="bg-background text-foreground">{p.name} ({p.code}) • Stok: {p.stok_saat_ini} pcs</option>))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Aksi Stok</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={stockAdjustment.operation === 'In' ? 'default' : 'outline'} onClick={() => setStockAdjustment({ ...stockAdjustment, operation: 'In' })}>Tambah Stok (Masuk)</Button>
                <Button type="button" variant={stockAdjustment.operation === 'Out' ? 'default' : 'outline'} onClick={() => setStockAdjustment({ ...stockAdjustment, operation: 'Out' })}>Kurangi Stok (Keluar)</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kuantitas (Pcs)</Label>
              <Input type="number" required min="1" value={stockAdjustment.qty} onChange={(e) => setStockAdjustment({ ...stockAdjustment, qty: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Keterangan Mutasi</Label>
              <Input required placeholder="Cth: Koreksi opname bulanan" value={stockAdjustment.remarks} onChange={(e) => setStockAdjustment({ ...stockAdjustment, remarks: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsUpdateStockOpen(false); setSelectedProduct(null) }}>Batal</Button>
              <Button type="submit" disabled={actionLoading}>{actionLoading ? 'Memproses...' : 'Proses Mutasi'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="size-5" /> Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk <b>{selectedProduct?.name}</b>?
              Data lama pada laporan penjualan tidak akan hilang, tapi produk ini tidak akan muncul di katalog kasir lagi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={actionLoading}>{actionLoading ? 'Menghapus...' : 'Ya, Hapus'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
