// Pembuatan backend 2 : API Endpoint untuk proses 1.0
// Modul ini bertugas menerima data nasabah, validate, simpan
// ke D1 (Data Nasabah), pembuat rekening otomatis yang masuk ke D2 (Data rekening)

import prisma from '../../../src/lib/prisma'
import { NextResponse } from 'next/server'

// GET : Ambil data nasabah dan rekeningnya (D1 & D2)
export async function GET() {
    try {
        const dataNasabah = await prisma.nasabah.findMany({
            include: { rekening: true },
        })
        return NextResponse.json({ success: true, data: dataNasabah }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message },  { status: 200 })
    }
}

// POST : Pendaftaran Nasabah baru & Pembuatan rekening otomatis (proses 1.0)
export async function POST(request) {
    try {
        const body = await request.json()
        const { nama, nik, telepon, saldoAwal } = body
        
        // Validasi sederhana saat login 
        if (!nama || !nik || !telepon) {
            return NextResponse.json({ success: false, message: 'Semua field wajib diisi!' }, { status: 400 })
        }

        // Generate nomor rekening unik secara otomatis (contoh: 8 koordinat waktu + angka acak)
        const noRekening = '707' + Math.floor(100000 + Math.random() * 900000)

        // Simpan ke database (D1 Nasabah & D2 Rekening)
        const nasabahBaru = await prisma.nasabah.create({
            data: {
                nama,
                nik,
                telepon,
                rekening: {
                    create: {
                        noRekening: noRekening,
                        saldo: parseFloat(saldoAwal) || 0.0,
                        status: 'AKTIF'
                    }
                }
            },
            include: { rekening: true }
        })

        return NextResponse.json({
            success: true,
            message: 'Nasabah dan rekening berhasil didaftarkan!',
            data: nasabahBaru
        }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ success: false, message: 'NIK sudah terdaftar atau terjadi kesalahan server.', error: error.message }, { status: 500 })
    }
}