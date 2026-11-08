// Pembuatan backend 1 : hot reloading ketika koneksi db dibuka
// Fungsi function ini bertujuan ketika website dibuka, koneksi tidak terus
// meminta banyak ke server supaya tidak lelah

import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const prismaClientSingleton = () => {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" })
    return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma