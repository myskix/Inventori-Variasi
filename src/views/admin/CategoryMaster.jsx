import React, { useState, useEffect, useMemo } from 'react'
import { api } from '../../services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus, Pencil, Trash2, ShieldAlert } from 'lucide-react'
import { EmptyState } from '../../components/EmptyState'
import { Pagination } from '../../components/ui/pagination'
import { useToast } from '../../components/ui/toast'
import { useAuth } from '../../context/AuthContext'

export default function CategoryMaster() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [currentCategory, setCurrentCategory] = useState(null)
  
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true })
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await api.getCategories()
      setCategories(data.filter(c => !c.is_deleted))
    } catch (err) {
      toast({ title: 'Gagal memuat data', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()))
  }, [categories, search])

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  }, [filteredCategories, page])

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.createCategory(formData)
      toast({ title: 'Berhasil', description: 'Kategori berhasil ditambahkan.' })
      setIsAddOpen(false)
      loadData()
    } catch (err) {
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.updateCategory(currentCategory.id, formData)
      toast({ title: 'Berhasil', description: 'Kategori berhasil diperbarui.' })
      setIsEditOpen(false)
      loadData()
    } catch (err) {
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await api.deleteCategory(currentCategory.id)
      toast({ title: 'Berhasil', description: 'Kategori berhasil dihapus.' })
      setIsDeleteOpen(false)
      loadData()
    } catch (err) {
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const openAdd = () => {
    setFormData({ name: '', description: '', is_active: true })
    setIsAddOpen(true)
  }

  const openEdit = (cat) => {
    setCurrentCategory(cat)
    setFormData({ name: cat.name, description: cat.description, is_active: cat.is_active })
    setIsEditOpen(true)
  }

  const openDelete = (cat) => {
    setCurrentCategory(cat)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Master Kategori</h2>
          <p className="text-sm text-muted-foreground">Kelola kategori produk dan suku cadang.</p>
        </div>
        <Button onClick={openAdd}><Plus className="size-4" /> Tambah Kategori</Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Cari kategori..." 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
              className="pl-9" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Memuat data...</div>
          ) : filteredCategories.length === 0 ? (
            <EmptyState title="Kategori Kosong" description="Belum ada kategori yang ditambahkan atau cocok dengan pencarian." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCategories.map((c) => (
                    <TableRow key={c.id} className={!c.is_active ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.description || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={c.is_active ? 'default' : 'secondary'}>
                          {c.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="size-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDelete(c)}><Trash2 className="size-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="py-4">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Kategori</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input required placeholder="Contoh: Ban & Velg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input placeholder="Keterangan singkat" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Kategori</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select 
                value={formData.is_active ? 'true' : 'false'} 
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="true" className="bg-background text-foreground">Aktif</option>
                <option value="false" className="bg-background text-foreground">Nonaktif</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button>
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
              Apakah Anda yakin ingin menghapus kategori <b>{currentCategory?.name}</b>?
              Kategori ini tidak akan bisa dipilih lagi, namun data lama tidak akan hilang.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>{submitting ? 'Menghapus...' : 'Ya, Hapus'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
