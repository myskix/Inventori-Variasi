import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Plus, Minus, ShoppingBag, User, Phone, Car, Shield, Banknote, QrCode,
  Printer, X, AlertCircle, CheckCircle, Search, Wrench, Zap
} from 'lucide-react'

// --- THERMAL RECEIPT MODAL ---
function ThermalReceiptModal({ isOpen, onClose, transactionData }) {
  if (!isOpen || !transactionData) return null

  const { transaction, details, warranties } = transactionData
  const dateStr = new Date(transaction.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Struk Pembayaran</DialogTitle></DialogHeader>

        {/* Receipt Wrapper (thermal paper style) */}
        <div className="rounded-lg border bg-white p-6 font-mono text-xs text-slate-950 shadow-sm select-none">
          <div className="mb-4 text-center">
            <h3 className="text-sm font-black uppercase tracking-tight">Toko Variasi Motor</h3>
            <p className="text-[10px] text-slate-600">Pekanbaru, Riau</p>
            <p className="text-[10px] text-slate-500">HP: 0812-7766-5544</p>
            <Separator className="my-2 border-dashed" />
            <h4 className="font-bold">STRUK PEMBAYARAN</h4>
          </div>

          <div className="mb-3 space-y-1 text-[10px] text-slate-700">
            <div className="flex justify-between"><span>Invoice:</span><span className="font-bold">{transaction.invoice_no}</span></div>
            <div className="flex justify-between"><span>Tanggal:</span><span>{dateStr}</span></div>
            <div className="flex justify-between"><span>Kasir:</span><span className="capitalize">{transaction.cashier_id === 'usr-001' ? 'Pak Adi' : 'Rian'}</span></div>
            <Separator className="my-2 border-dashed" />
            <div className="flex justify-between font-bold text-slate-900"><span>Pelanggan:</span><span className="max-w-[150px] truncate">{transaction.customer_details.name}</span></div>
            <div className="flex justify-between"><span>WhatsApp:</span><span>{transaction.customer_details.phone}</span></div>
            <div className="flex justify-between"><span>No Plat:</span><span className="font-bold uppercase">{transaction.customer_details.plat_nomor}</span></div>
            {transaction.customer_details.vehicle !== '-' && (
              <div className="flex justify-between"><span>Kendaraan:</span><span className="max-w-[150px] truncate">{transaction.customer_details.vehicle}</span></div>
            )}
            {transaction.customer_details.notes !== '-' && (
              <div className="flex flex-col mt-1">
                <span>Catatan:</span><span className="max-w-full text-left italic">{transaction.customer_details.notes}</span>
              </div>
            )}
          </div>

          <Separator className="my-2 border-dashed" />

          <div className="mb-3 space-y-2">
            <div className="grid grid-cols-12 font-bold text-slate-900">
              <span className="col-span-6">Deskripsi</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Subtotal</span>
            </div>
            {details.map((item) => (
              <div key={item.id} className="grid grid-cols-12 text-slate-700">
                <div className="col-span-6 truncate pr-1">{item.name}</div>
                <div className="col-span-2 text-center">x{item.quantity}</div>
                <div className="col-span-4 text-right">{item.subtotal.toLocaleString('id-ID')}</div>
              </div>
            ))}
          </div>

          <Separator className="my-2 border-dashed" />

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-sm font-extrabold text-slate-950">
              <span>GRAND TOTAL:</span>
              <span>Rp{transaction.total_amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Metode Bayar:</span><span>{transaction.payment_method}</span>
            </div>
          </div>

          {warranties.length > 0 && (
            <>
              <Separator className="my-2 border-dashed" />
              <div className="space-y-1 text-[9px] text-slate-700">
                <div className="text-center font-bold uppercase text-slate-950">Garansi Terbit</div>
                {warranties.map((w) => (
                  <div key={w.id} className="flex justify-between">
                    <span className="max-w-[140px] truncate">• {w.product_name}</span>
                    <span>{w.duration_days} Hari (s/d {w.expiry_date})</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <Separator className="my-3 border-dashed" />
          <p className="text-center text-[9px] italic text-slate-500">
            Terima kasih atas kunjungan Anda!<br />Silakan simpan struk ini sebagai bukti jaminan garansi.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => window.print()} className="flex-1"><Printer className="size-4" />Print Struk</Button>
          <Button onClick={onClose} className="flex-1">Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- MAIN POS CHECKOUT ---
export default function POSCheckout() {
  const { user } = useAuth()

  const [products, setProducts] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [serviceName, setServiceName] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerPlate, setCustomerPlate] = useState('')
  const [customerVehicle, setCustomerVehicle] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [customWarrantyDays, setCustomWarrantyDays] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [cart, setCart] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  const loadCatalog = async () => {
    try {
      const prodList = await api.getActiveProducts()
      setProducts(prodList)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { loadCatalog() }, [])

  const filteredProducts = products.filter((p) => {
    const term = productSearch.toLowerCase()
    return p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term) || p.id.toLowerCase().includes(term)
  })

  const addToCartProduct = (product) => {
    if (product.stok_saat_ini <= 0) { setError(`Produk "${product.name}" kehabisan stok!`); setTimeout(() => setError(null), 3000); return }
    setCart((prev) => {
      const existing = prev.find((item) => item.type === 'product' && item.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stok_saat_ini) { setError(`Kuantitas melebihi stok tersedia (${product.stok_saat_ini} pcs)!`); setTimeout(() => setError(null), 3000); return prev }
        return prev.map((item) => item.type === 'product' && item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { type: 'product', id: product.id, name: product.name, code: product.code, price: product.harga_jual, quantity: 1, maxStock: product.stok_saat_ini }]
    })
    setProductSearch('')
    setShowProductDropdown(false)
  }

  const addToCartService = () => {
    if (!servicePrice || Number(servicePrice) <= 0) {
      setError('Harga jasa tidak valid!')
      setTimeout(() => setError(null), 3000)
      return
    }
    const calculatedPrice = Number(servicePrice)
    const sName = serviceName || 'Jasa Pasang / Mekanik'
    
    setCart((prev) => {
      const existing = prev.find((item) => item.type === 'service' && item.name === sName && item.price === calculatedPrice)
      if (existing) return prev.map((item) => item.type === 'service' && item.name === sName && item.price === calculatedPrice ? { ...item, quantity: item.quantity + 1 } : item)
      return [...prev, { type: 'service', id: `svc-manual-${Date.now()}`, name: sName, price: calculatedPrice, quantity: 1, difficulty: 'Manual' }]
    })
    
    setServiceName('')
    setServicePrice('')
  }

  const updateCartQty = (index, change) => {
    setCart((prev) => {
      const updated = [...prev]
      const item = updated[index]
      const newQty = item.quantity + change
      if (newQty <= 0) { updated.splice(index, 1); return updated }
      if (item.type === 'product' && newQty > item.maxStock) { setError(`Maksimal stok tercapai untuk ${item.name}!`); setTimeout(() => setError(null), 3000); return prev }
      updated[index] = { ...item, quantity: newQty }
      return updated
    })
  }

  const getGrandTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault()
    if (!user) { setError('Anda harus login terlebih dahulu!'); return }
    if (cart.length === 0) { setError('Keranjang belanja kosong!'); return }
    if (!customerName.trim() || !customerPhone.trim() || !customerPlate.trim()) {
      setError('Nama Pelanggan, No WhatsApp, dan No Plat wajib diisi!'); return 
    }
    
    setSubmitting(true)
    setError(null)
    const customerDetails = { 
      name: customerName.trim(), 
      phone: customerPhone.trim(), 
      plat_nomor: customerPlate.trim(),
      vehicle: customerVehicle.trim() || '-',
      notes: customerNotes.trim() || '-'
    }
    const checkoutItems = cart.map((item) => ({ type: item.type, id: item.id, quantity: item.quantity, price: item.type === 'product' ? item.price : item.basePrice, difficulty: item.difficulty || 'Simple' }))
    try {
      const res = await api.createTransaction({ customer_id: null, customer_details: customerDetails, items: checkoutItems, payment_method: paymentMethod, cashier_id: user.id, warranty_duration_days: customWarrantyDays ? Number(customWarrantyDays) : undefined })
      setReceiptData(res)
      setIsReceiptOpen(true)
      setSuccess(`Transaksi berhasil! Invoice: ${res.transaction.invoice_no}`)
      setCart([]); setCustomerName(''); setCustomerPhone(''); setCustomerPlate(''); setCustomerVehicle(''); setCustomerNotes(''); setCustomWarrantyDays('')
      await loadCatalog()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">

      {/* LEFT COLUMN: Input & Metadata (7 cols) */}
      <div className="flex flex-col gap-6 lg:col-span-7">

        {/* Panel: Add Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><ShoppingBag className="size-4" /> Input Item Belanja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product search */}
            <div className="relative">
              <Label className="mb-1.5">Cari & Tambah Produk</Label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari SKU, nama, atau deskripsi..."
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true) }}
                    onFocus={() => setShowProductDropdown(true)}
                    className="pl-9"
                  />
                </div>
                {productSearch && (
                  <Button variant="outline" size="icon" onClick={() => { setProductSearch(''); setShowProductDropdown(false) }}><X className="size-4" /></Button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showProductDropdown && productSearch && (
                <div className="absolute left-0 right-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
                  {filteredProducts.length === 0 ? (
                    <div className="py-3 text-center text-sm text-muted-foreground">Produk tidak ditemukan</div>
                  ) : (
                    filteredProducts.map((p) => {
                      const isOutOfStock = p.stok_saat_ini <= 0
                      const isLowStock = p.stok_saat_ini <= p.stok_minimum
                      return (
                        <button
                          key={p.id} type="button" disabled={isOutOfStock}
                          onClick={() => addToCartProduct(p)}
                          className="flex w-full items-center justify-between rounded-md p-2.5 text-left transition-colors hover:bg-accent disabled:opacity-50"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="text-sm font-semibold">{p.name}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">{p.code} • Rp{p.harga_jual.toLocaleString('id-ID')}</div>
                          </div>
                          <Badge variant={isOutOfStock ? 'destructive' : isLowStock ? 'secondary' : 'outline'} className="text-[10px]">
                            {isOutOfStock ? 'Habis' : `${p.stok_saat_ini} pcs`}
                          </Badge>
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Service selection */}
            <div>
              <Label className="mb-1.5">Jasa Pasang / Service Mekanik</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                <div className="sm:col-span-5">
                  <Input 
                    placeholder="Nama Jasa (Opsional)" 
                    value={serviceName} 
                    onChange={e => setServiceName(e.target.value)} 
                  />
                </div>
                <div className="sm:col-span-4">
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="Harga Jasa (Rp)" 
                    value={servicePrice} 
                    onChange={e => setServicePrice(e.target.value)} 
                  />
                </div>
                <div className="sm:col-span-3">
                  <Button onClick={addToCartService} disabled={!servicePrice} className="w-full">
                    <Plus className="mr-1 size-4" /> Tambah
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel: Customer & Transaction Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><User className="size-4" /> Informasi Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nama Pelanggan <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input required placeholder="Nama Lengkap" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>No WhatsApp <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input required type="tel" placeholder="08xxxxxxxxxx" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>No Plat Kendaraan <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input required placeholder="BM 1234 PA" value={customerPlate} onChange={(e) => setCustomerPlate(e.target.value)} className="pl-9 uppercase" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jenis Kendaraan (Opsional)</Label>
                <Input placeholder="Cth: NMAX 155 Putih" value={customerVehicle} onChange={(e) => setCustomerVehicle(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Catatan (Opsional)</Label>
                <Input placeholder="Tuliskan catatan keluhan atau instruksi khusus..." value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2 mt-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>Durasi Garansi Manual</Label>
                  <span className="text-[10px] text-muted-foreground">Override (Hari)</span>
                </div>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="number" min="0" placeholder="Biarkan kosong jika mengikuti Master Produk" value={customWarrantyDays} onChange={(e) => setCustomWarrantyDays(e.target.value)} className="pl-9" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Cart & Payment (5 cols) */}
      <div className="flex flex-col gap-6 self-stretch lg:col-span-5">
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><ShoppingBag className="size-4" /> Ringkasan Belanja</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {/* Cart Table */}
            <div className="flex min-h-[220px] flex-1 flex-col overflow-hidden rounded-lg border border-border">
              <div className="max-h-[350px] flex-grow overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
                    <ShoppingBag className="size-8 opacity-50" />
                    <span className="text-sm">Belum ada item di keranjang.</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="font-semibold">{item.name}</div>
                            <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                              {item.code}
                              {item.type === 'service' && (
                                <Badge variant={item.difficulty === 'Complex' ? 'default' : 'secondary'} className="text-[9px] px-1 py-0">{item.difficulty}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center gap-1 rounded-md border border-border px-1">
                              <Button variant="ghost" size="icon" className="size-6" onClick={() => updateCartQty(index, -1)}><Minus className="size-3" /></Button>
                              <span className="min-w-[18px] text-center text-sm font-bold">{item.quantity}</span>
                              <Button variant="ghost" size="icon" className="size-6" onClick={() => updateCartQty(index, 1)}><Plus className="size-3" /></Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{(item.price * item.quantity).toLocaleString('id-ID')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            {/* Checkout & Settle */}
            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-4 space-y-2">
                <Label>Metode Pembayaran</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ method: 'Cash', icon: Banknote, label: 'Tunai (Cash)' }, { method: 'Transfer QRIS', icon: QrCode, label: 'QRIS / Bank' }].map(({ method, icon: Icon, label }) => (
                    <Button key={method} type="button" variant={paymentMethod === method ? 'default' : 'outline'} onClick={() => setPaymentMethod(method)} className="justify-start">
                      <Icon className="size-4" /> {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Grand Total */}
              <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3.5">
                <span className="text-sm font-semibold text-muted-foreground">Total Pembayaran:</span>
                <span className="text-xl font-black">Rp{getGrandTotal().toLocaleString('id-ID')}</span>
              </div>

              {/* Status alerts */}
              {error && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-2.5 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" /> <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-2.5 text-sm text-green-500">
                  <CheckCircle className="mt-0.5 size-4 shrink-0" /> <span>{success}</span>
                </div>
              )}

              <Button onClick={handleCheckoutSubmit} disabled={submitting || cart.length === 0} className="w-full bg-green-600 text-white hover:bg-green-700" size="lg">
                {submitting ? 'Memproses Checkout...' : <><Banknote className="size-4" /> Selesaikan Transaksi</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thermal Receipt */}
      <ThermalReceiptModal isOpen={isReceiptOpen} onClose={() => { setIsReceiptOpen(false); setReceiptData(null); setSuccess(null) }} transactionData={receiptData} />
    </div>
  )
}
