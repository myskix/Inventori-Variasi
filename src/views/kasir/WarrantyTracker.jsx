import React, { useState, useEffect } from 'react'
import { mockApi } from '../../services/mockApi'

export default function WarrantyTracker() {
  const [warranties, setWarranties] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const loadWarranties = async () => {
    setLoading(true)
    try {
      const list = await mockApi.getWarranties()
      // Sort newest first
      setWarranties([...list].reverse())
    } catch (err) {
      console.error('Failed to load warranties:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWarranties()
  }, [])

  // Check if warranty is expired based on current date
  const checkIsExpired = (expiryDateStr) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDateStr)
    expiry.setHours(0, 0, 0, 0)
    return today > expiry
  }

  // Filter based on Whatsapp OR License Plate
  const filteredWarranties = warranties.filter((w) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true // Show all by default

    const matchPlat = w.customer_plat?.toLowerCase().includes(query)
    const matchPhone = w.customer_phone?.toLowerCase().includes(query)
    return matchPlat || matchPhone
  })

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
      
      {/* Title & Description */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-purple-400">🛡️</span> Pelacakan Garansi Digital
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Cari status jaminan garansi komponen pelanggan berdasarkan No Plat Kendaraan atau No WhatsApp.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Masukkan No Plat Kendaraan (cth: BM 1234 PA) atau No WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 focus:border-purple-500 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-100 placeholder-slate-655 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 hover:text-white"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Table Panel */}
      <div className="border border-slate-850 bg-slate-950 rounded-xl overflow-hidden shadow-inner">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500">Memuat data garansi...</div>
        ) : filteredWarranties.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col gap-2">
            <span className="text-2xl">📭</span>
            <span className="text-xs font-semibold">Data garansi tidak ditemukan</span>
            <span className="text-[10px] text-slate-600">Periksa kembali keyword pencarian plat nomor atau nomor WA.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 bg-slate-900/35">
                  <th className="p-3.5 font-bold uppercase tracking-wider">Komponen Terpasang</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Pelanggan & Kendaraan</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider">Masa Garansi</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredWarranties.map((w) => {
                  const expired = checkIsExpired(w.expiry_date)
                  
                  return (
                    <tr key={w.id} className="hover:bg-slate-900/15 transition-colors">
                      {/* Component Info */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-200">{w.product_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          ID: {w.transaksi_id.replace('trx-', 'TRX-')}
                        </div>
                      </td>

                      {/* Customer & Vehicle Info */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{w.customer_name}</div>
                        <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                          <span className="bg-slate-900 text-slate-300 font-mono px-1 rounded uppercase border border-slate-850 text-[9px] font-bold">
                            🚗 {w.customer_plat || '-'}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span>📞 {w.customer_phone || '-'}</span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="p-3.5">
                        <div className="text-slate-200">
                          {w.duration_days} Hari
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Exp: <span className="font-semibold">{new Date(w.expiry_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                        </div>
                      </td>

                      {/* Expiry Badge */}
                      <td className="p-3.5 text-center">
                        {expired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950/65 text-red-400 border border-red-900/40">
                            🔴 Kedaluwarsa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-950/65 text-green-400 border border-green-900/40">
                            🟢 Garansi Aktif
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
