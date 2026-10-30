-- CreateTable
CREATE TABLE "Nasabah" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "telepon" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Rekening" (
    "noRekening" TEXT NOT NULL PRIMARY KEY,
    "nasabahId" TEXT NOT NULL,
    "saldo" REAL NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    CONSTRAINT "Rekening_nasabahId_fkey" FOREIGN KEY ("nasabahId") REFERENCES "Nasabah" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noRekening" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "nominal" REAL NOT NULL,
    "tujuanTransfer" TEXT,
    "waktu" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'SUKSES',
    CONSTRAINT "Transaksi_noRekening_fkey" FOREIGN KEY ("noRekening") REFERENCES "Rekening" ("noRekening") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Nasabah_nik_key" ON "Nasabah"("nik");
