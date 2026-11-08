// Membuat properti baru yaitu prisma
// Supaya dapat dikenali Typescript untuk dimasukkan ke globalThis

import { PrismaClient } from "@prisma/client/extension";

declare global {
    var prisma: PrismaClient | undefined
}