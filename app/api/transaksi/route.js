// Pembuatan backend 3 : Membuat API Endpoint untuk proses 2.0 (Transaksi)
// Fungsi function ini menangani 3 jenis transaksi utama : Setor, tarik
// dan transfer. Data ini akan memperbarui D2 dan mencatat ke D3

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET : Mengambil riwayat data transaksi (D3)
export async function GET() {
    try {
        const riwayatTransaksi = await prisma.transaksi.findMany({
            include: { rekening: true },
            orderBy: { waktu: 'desc' }
        })
        return NextResponse.json ({ success: true, data: riwayatTransaksi }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}

// POST : Pemrosesann Transaksi (Setor, Tarik, Transfer) - Proses 2.0
export async function POST(request) {
    try {
        const body = await request.json()
        const { noRekening, jenis, nominal, tujuanTransfer } = body

        // 1. Validasi Input dasar
        if (!noRekening || !jenis || !nominal || nominal <= 0) {
            return NextResponse.json({ success: false, message: 'Data transaksi tidak valid' }, { status: 400 })
        }

        // 2. Cek apakah rekening pengirim terdaftar di server (D2 Data Rekening)
        const rekeningAsal = await prisma.rekening.findUnique({
            where: { noRekening }
        })

        if (!rekeningAsal || rekeningAsal.status !== 'AKTIF') {
            return NextResponse.json({ success: false, message: 'Rekening asal tidak ditemukan atau di blokir!'}, { status: 404 })
        }

        let saldoBaru = rekeningAsal.saldo

        // 3. Logika pilihan berdasarkan jenis transaksi
        if (jenis === 'SETOR') {
            saldoBaru += parseFloat(nominal)
        }
        else if (jenis === 'TARIK') {
            if (rekeningAsal.saldo < nominal) {
                return NextResponse.json({ success: false, message: 'Saldo anda tidak mencukupi untuk penarikan!'}, { status: 400 })
            }
            saldoBaru -= parseFloat(nominal)
        }
        else if (jenis === 'TRANSFER') {
            if (!tujuanTransfer) {
                return NextResponse.json({ success: false, message: 'Nomor rekening tujuan wajib diisi'}, { status: 400 })
            }
            if (rekeningAsal.saldo < nominal) {
                return NextResponse.json({ success: false, message: 'Saldo anda tidak mencukupi untuk transfer!'}, { status: 400 })
            }

            // Cek rekening tujuan
            const rekeningTujuan = await prisma.rekening.findUnique({
                where: { noRekening: tujuanTransfer }
            })
            if (!rekeningTujuan || rekeningTujuan.status !== 'AKTIF') {
                return NextResponse.json({ success: false, message: 'Rekening tujuan tidak ditemukan atau di blokir!'}, { status: 400 })
            }

            // Eksekusi mutasi rekening tujuan dalam satu transaksi database
            await prisma.rekening.update({
                where: { noRekening: tujuanTransfer },
                data: { saldo: rekeningTujuan.saldo + parseFloat(nominal) }
            })

            saldoBaru -= parseFloat(nominal)
        } else {
            return NextResponse.json({ success: false, message: 'Jenis transaksi tidak diketahui!'}, { status: 400 })
        }

        // 4. Update saldo rekening dari pengirim (Update ke D2 Data Rekening)
        await prisma.rekening.update({
            where: { noRekening },
            data: { saldo: saldoBaru }
        })

        // 5. Catat riwayat ke DataStore D3 (Data Transaksi & Audit Trail)
        const transaksiBaru = await prisma.transaksi.create({
            data: {
                noRekening,
                jenis,
                nominal: parseFloat(nominal),
                tujuanTransfer: tujuanTransfer || null,
                status: 'SUKSES'
            }
        })

        console.log("Transaksi telah tercatat ke D3: ", transaksiBaru)

        return NextResponse.json({
            success: true,
            message: `Transaksi ${jenis} berhasil diproses dan dicatat ke audit trail`,
            data: transaksiBaru
        }, { status: 201 })
    } catch (error) {
        console.error("Error saat memproses transaksi!: ", error)
        return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server', error: error.message}, { status: 500 })
    }
}