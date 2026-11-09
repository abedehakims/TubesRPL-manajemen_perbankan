// Pembuatan backend 4 : Proses 3.0 (Pengawasan & Pelaporan)
// Fungsi ini bertujuan untuk mengakses data riwayat transaksi D3 dan D2
// melakukan analisis risiko otomatis
// Dengan cara agregasi data store dan menyediakan struktur data siap saji

import prisma from "../../../src/lib/prisma"
import { NextResponse } from 'next/server'

// GET : PROSES 3.0 - Pengawasan Risiko & Pelaporan (Manajemen & OJK/BI)
export async function GET() {
    try {
        // 1. Mengambil data dari D3 (Data Transaksi) dan D2 (Data rekening)
        const transaksiList = await prisma.transaksi.findMany({
            include: {
                rekening: {
                    include: { nasabah: true }
                }
            },
            orderBy: { waktu: 'desc' }
        })

        const semuaRekening = await prisma.rekening.findMany()
        const totalNasabah = await prisma.nasabah.count()

        // Hitung total dana terhimpun di bank
        const totalDanaTerhimpun = semuaRekening.reduce((acc, curr) => acc + curr.saldo, 0)
    
        // 2. Analisis Manajemen Risiko (Deteksi Transaksi Mencurigakan / High Volume)
        // Ambang batas risiko : transaksi >= Rp10.000.000,-
        const AMBANG_BATAS_RISIKO = 10000000
        const transaksiBerisiko = transaksiList.filter(t => t.nominal >= AMBANG_BATAS_RISIKO)

        // 3. Ringkasan Laporan Keuangan untuk manajemen bank
        const laporanKeuangan = {
            totalNasabah,
            totalRekeningAktif: semuaRekening.length,
            totalDanaTerhimpun,
            totalJumlahTransaksi: transaksiList.length,
        }

        // 4. Laporan Kepatuhan Regulator (OJK / BI)
        const laporanKepatuhan = {
            statusRegulasi: "PATUH (COMPLIANT)",
            standarPengawasan: "UU Perbankan & Ketentuan APU-PPT OJK",
            jumlahTransaksiDiawasi: transaksiBerisiko.length,
            keterangan: "Seluruh aktivitas mutasi rekening telah terekam secara transparan"
        }

        return NextResponse.json({
            success: true,
            message: "Data pengawasan dan laporan berhasil ditarik dari sistem.",
            data: {
                laporanKeuangan,
                laporanKepatuhan,
                transaksiBerisiko
            }
        }, { status: 200 })
    } catch (error) {
        console.error("Error fetching laporan API:", error)
        return NextResponse.json({
            success: false,
            message: "Gagal memproses laporan manajemen risiko",
            error: error.message
        }, { status: 500 })
    }
}