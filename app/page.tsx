// PEMBUATAN FRONT-END 1 : Menghubungkan 3 endpoint (nasabah, transaksi, laporan)
// Supaya dapat mendaftarkan nasabah, melakukan transaksi dan melihat laporan

'use client'

import { useState, useEffect } from "react"

// Define Interface untuk struktur data dari DATABASE / API
interface Rekening {
  noRekening: string
  nasabahId: string
  saldo: number
  status: string
}

interface Nasabah {
  id: string
  nama: string
  nik: string
  telepon: string
  rekening: Rekening[]
  createdAt: string
}

interface Transaksi {
  id: string
  noRekening: string
  jenis: string
  nominal: number
  tujuanTransfer?: string | null
  waktu: string
  status: string
  rekening?: {
    nasabah?: {
      nama: string
    }
  }
}

interface LaporanData {
  laporanKeuangan: {
    totalNasabah: number
    totalRekeningAktif: number
    totalDanaTerhimpun: number
    totalJumlahTransaksi: number
  }
  laporanKepatuhan: {
    statusRegulasi: string
    standarPengawasan: string
    jumlahTransaksiDiawasi: number
    keterangan: string
  }
  transaksiBerisiko: Transaksi[]
}

export default function Home() {
  const [tab, setTab] = useState('pendaftaran') // 'pendaftaran | 'transaksi' | 'laporan'

  // State data untuk mengingat semua activity di frontend
  const [nasabahList, setNasabahList] = useState<Nasabah[]>([])
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([])
  const [laporan, setLaporan] = useState<LaporanData | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Form state Proses 1.0 (Pendaftaran)
  const [formNasabah, setFormNasabah] = useState({ nama: '', nik: '', telepon: '', saldoAwal: '' })

  // Form state Proses 2.0 (Transaksi)
  const [formTransaksi, setFormTransaksi] = useState({ noRekening: '', jenis: 'SETOR', nominal: '', tujuanTransfer: '' })

  // Load Data awal
  useEffect(() => {
    fetchNasabah()
    fetchTransaksi()
    fetchLaporan()
  }, [])

  const fetchNasabah = async () => {
    try {
      const res = await fetch('/api/nasabah')
      const text = await res.text()
      if (!text) return
      const data = JSON.parse(text)
      if (data.success) setNasabahList(data.data)
    } catch (error) {
      console.error("Gagal fetch nasabah: ", error)
    }
  }

  const fetchTransaksi = async () => {
    try {
      const res = await fetch('/api/transaksi')
      const text = await res.text()
      if (!text) return
      const data = JSON.parse(text)
      if (data.success) setTransaksiList(data.data)
    } catch (error) {
      console.error("Gagal fetch Transaksi: ", error)
    }
  }

  const fetchLaporan = async () => {
    try {
      const res = await fetch('/api/laporan')
      const text = await res.text()
      if (!text) return
      const data = JSON.parse(text)
      if (data.success) setLaporan(data.data)
    } catch (error) {
      console.error("Gagal fetch Laporan: ",error)
    }
  }

  // Handle submit Pendaftaran (Proses 1.0)
  const handleRegister = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/nasabah', {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json' },
        body: JSON.stringify(formNasabah)
      })
      const data = await res.json()
      if (data.success) {
        setMessage('✅ ' + data.message)
        setFormNasabah({ nama: '', nik: '', telepon:'', saldoAwal: '' })
        // Tarik data terbaru secara paralel agar UI langsung ter-update tanpa refresh
        await Promise.all([
          fetchNasabah(),
          fetchTransaksi(),
          fetchLaporan()
        ])
      } else {
        setMessage('❌ ' + data.message)
      }
    } catch (err) {
      setMessage('❌ Terjadi kesalahan jaringan.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Submit Transaksi (Proses 2.0)
  const handleTransaction = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json' },
        body: JSON.stringify(formTransaksi)
      })
      const data = await res.json()
      if (data.success) {
        setMessage('✅ ' + data.message)
        setFormTransaksi({ noRekening: '', jenis: 'SETOR', nominal:'', tujuanTransfer: '' })
        // REAKTIF: Tarik data terbaru secara paralel agar UI langsung ter-update tanpa refresh
        await Promise.all([
          fetchNasabah(),
          fetchTransaksi(),
          fetchLaporan()
        ])
      } else {
        setMessage('❌ ' + data.message)
      }
    } catch (error) {
      setMessage('❌ Terjadi kesalahan jaringan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-6 rounded-2xl shadow-md">
          <h1 className="text-3xl font-bold">DanaAlir ~ Sistem Manajemen Perbankan</h1>
          <p className="text-blue-100 text-sm mt-1">Implementasi Paradigma Terstruktur (DFD Level 0 & Level 1)</p>
        </header>

        {/* Notifikasi Pesan */}
        {message && (
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-medium">
            {message}
          </div>
        )}

        {/* Tab Navigasi */}
        <div className="flex space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => { setTab('pendaftaran'); setMessage(''); }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${tab === 'pendaftaran' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            Proses 1.0 - Pendaftaran Nasabah (D1 & D2)
          </button>
          <button
            onClick={() => { setTab('transaksi'); setMessage(''); }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${tab === 'transaksi' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            Proses 2.0 - Pemrosesan Transaksi (D2 & D3)
          </button>
          <button
            onClick={() => { setTab('laporan'); setMessage(''); }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${tab === 'laporan' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            Proses 3.0 - Manajemen Risiko & Laporan
          </button>
        </div>

        {/* TAB 1: PROSES 1.0 (PENDAFTARAN) */}
        {tab === 'pendaftaran' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-1">
              <h2 className="text-lg font-bold mb-4 text-blue-900">Form Pendaftaran Nasabah</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                  <input
                    type="text" required value={formNasabah.nama}
                    onChange={(e) => setFormNasabah({ ...formNasabah, nama: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Rosemary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">NIK (KTP)</label>
                  <input
                    type="text" required value={formNasabah.nik}
                    onChange={(e) => setFormNasabah({ ...formNasabah, nik: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="317. . . . . ."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">No. Telepon</label>
                  <input
                    type="text" required value={formNasabah.telepon}
                    onChange={(e) => setFormNasabah({ ...formNasabah, telepon: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="08. . . . . . . . . ."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Setoran Awal (Rp)</label>
                  <input
                    type="number" min="0" required value={formNasabah.saldoAwal}
                    onChange={(e) => setFormNasabah({ ...formNasabah, saldoAwal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="500000"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Daftarkan Nasabah'}
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-2">
              <h2 className="text-lg font-bold mb-4 text-blue-900">DataStore D1 & D2 (Nasabah & Rekening)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                      <th className="p-3">No. Rekening</th>
                      <th className="p-3">Nama Nasabah</th>
                      <th className="p-3">NIK</th>
                      <th className="p-3">Saldo</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nasabahList.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-slate-400">Belum ada nasabah terdaftar.</td></tr>
                    ) : (
                      nasabahList.map((n) => (
                        n.rekening.map((r) => (
                          <tr key={r.noRekening} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-blue-700">{r.noRekening}</td>
                            <td className="p-3">{n.nama}</td>
                            <td className="p-3 text-slate-500">{n.nik}</td>
                            <td className="p-3 font-semibold text-emerald-600">Rp {r.saldo.toLocaleString('id-ID')}</td>
                            <td className="p-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">{r.status}</span></td>
                          </tr>
                        ))
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROSES 2.0 (TRANSAKSI) */}
        {tab === 'transaksi' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-1">
              <h2 className="text-lg font-bold mb-4 text-blue-900">Form Pemrosesan Transaksi</h2>
              <form onSubmit={handleTransaction} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">No. Rekening Asal</label>
                  <input
                    type="text" required value={formTransaksi.noRekening}
                    onChange={(e) => setFormTransaksi({ ...formTransaksi, noRekening: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan No. Rekening"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Jenis Transaksi</label>
                  <select
                    value={formTransaksi.jenis}
                    onChange={(e) => setFormTransaksi({ ...formTransaksi, jenis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SETOR">Setor Tunai</option>
                    <option value="TARIK">Tarik Tunai</option>
                    <option value="TRANSFER">Transfer Antar Rekening</option>
                  </select>
                </div>
                {formTransaksi.jenis === 'TRANSFER' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">No. Rekening Tujuan</label>
                    <input
                      type="text" required value={formTransaksi.tujuanTransfer}
                      onChange={(e) => setFormTransaksi({ ...formTransaksi, tujuanTransfer: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="No Rekening Penerima"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nominal (Rp)</label>
                  <input
                    type="number" min="10000" required value={formTransaksi.nominal}
                    onChange={(e) => setFormTransaksi({ ...formTransaksi, nominal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100000"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Proses Transaksi'}
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-2">
              <h2 className="text-lg font-bold mb-4 text-blue-900">DataStore D3 (Audit Trail Riwayat Transaksi)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Rekening</th>
                      <th className="p-3">Jenis</th>
                      <th className="p-3">Nominal</th>
                      <th className="p-3">Tujuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaksiList.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-slate-400">Belum ada riwayat transaksi.</td></tr>
                    ) : (
                      transaksiList.map((t) => (
                        <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 text-xs text-slate-500">{new Date(t.waktu).toLocaleString('id-ID')}</td>
                          <td className="p-3 font-mono font-medium">{t.noRekening}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.jenis === 'SETOR' ? 'bg-emerald-100 text-emerald-800' : t.jenis === 'TARIK' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                              {t.jenis}
                            </span>
                          </td>
                          <td className="p-3 font-semibold">Rp {t.nominal.toLocaleString('id-ID')}</td>
                          <td className="p-3 font-mono text-slate-500">{t.tujuanTransfer || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROSES 3.0 (LAPORAN & RISIKO) */}
        {tab === 'laporan' && (
          <div className="space-y-6">
            {!laporan ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-slate-400">
                Belum ada data laporan dan pengawasan risiko
              </div>
            ) : (
              <>
            {/* Kartu Ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold uppercase">Total Nasabah</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{laporan.laporanKeuangan.totalNasabah}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold uppercase">Total Dana Terhimpun</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">Rp {laporan.laporanKeuangan.totalDanaTerhimpun.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold uppercase">Total Mutasi Transaksi</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{laporan.laporanKeuangan.totalJumlahTransaksi}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold uppercase">Transaksi Risiko Tinggi</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{laporan.transaksiBerisiko.length}</p>
              </div>
            </div>

            {/* Panel Manajemen Risiko & Regulator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-md font-bold text-blue-900 mb-2">Laporan Manajemen Bank</h3>
                <p className="text-sm text-slate-600 mb-4">Pemantauan saldo terhimpun dan aktivitas operasional harian.</p>
                <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between"><span>Status Likuiditas:</span><span className="font-bold text-emerald-600">SEHAT</span></div>
                  <div className="flex justify-between"><span>Rekening Aktif:</span><span className="font-bold">{laporan.laporanKeuangan.totalRekeningAktif} Rekening</span></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-md font-bold text-blue-900 mb-2">Laporan Kepatuhan Regulator (OJK / BI)</h3>
                <p className="text-sm text-slate-600 mb-2">Status Audit: <span className="font-bold text-emerald-600">{laporan.laporanKepatuhan.statusRegulasi}</span></p>
                <p className="text-xs text-slate-500">{laporan.laporanKepatuhan.keterangan}</p>
              </div>
            </div>

            {/* Tabel Transaksi Berisiko (High Nominal >= 10 Juta) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-md font-bold text-amber-900 mb-2">Deteksi Transaksi Berisiko Tinggi (≥ Rp 10.000.000)</h3>
              <p className="text-xs text-slate-500 mb-4">Sistem otomatis menyaring transaksi bernilai besar untuk kepatuhan anti-pencucian uang (APU-PPT).</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-amber-50">
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Nasabah / Rekening</th>
                      <th className="p-3">Jenis</th>
                      <th className="p-3">Nominal Transaksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporan.transaksiBerisiko.length === 0 ? (
                      <tr><td colSpan={4} className="p-4 text-center text-slate-400">Tidak ada transaksi yang melebihi ambang batas risiko.</td></tr>
                    ) : (
                      laporan.transaksiBerisiko.map((t) => (
                        <tr key={t.id} className="border-b border-slate-100 hover:bg-amber-50/50">
                          <td className="p-3 text-xs text-slate-500">{new Date(t.waktu).toLocaleString('id-ID')}</td>
                          <td className="p-3 font-mono font-medium">{t.rekening?.nasabah?.nama} ({t.noRekening})</td>
                          <td className="p-3 font-semibold">{t.jenis}</td>
                          <td className="p-3 font-bold text-amber-700">Rp {t.nominal.toLocaleString('id-ID')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}