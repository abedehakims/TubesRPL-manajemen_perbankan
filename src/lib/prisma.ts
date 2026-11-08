// Pembuatan backend 1 : hot reloading ketika koneksi db dibuka
// Fungsi function ini bertujuan ketika website dibuka, koneksi tidak terus
// meminta banyak ke server supaya tidak lelah

import { PrismaClient } from "@/app/generated/prisma/client"
// import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  } as any);
}

declare const globalThis : {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

