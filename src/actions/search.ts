"use server"

import { prisma } from "@/lib/prisma"

export async function globalSearch(query: string) {
  if (!query || query.length < 2) return { products: [], spareParts: [] }

  try {
    const [products, spareParts] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { make: { contains: query, mode: 'insensitive' } },
            { modelNumber: { contains: query, mode: 'insensitive' } },
            { productName: { contains: query, mode: 'insensitive' } },
            { cpu: { contains: query, mode: 'insensitive' } },
            { generation: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          make: true,
          modelNumber: true,
          productName: true,
          cpu: true,
          salePrice: true,
        },
        take: 20,
      }),
      prisma.sparePart.findMany({
        where: {
          OR: [
            { make: { contains: query, mode: 'insensitive' } },
            { modelNumber: { contains: query, mode: 'insensitive' } },
            { productName: { contains: query, mode: 'insensitive' } },
            { cpu: { contains: query, mode: 'insensitive' } },
            { generation: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          make: true,
          modelNumber: true,
          productName: true,
          cpu: true,
          frontPanel: true,
          panel: true,
          screenNonTouch: true,
          screenTouch: true,
          hinge: true,
          touchPad: true,
          base: true,
          keyboard: true,
          battery: true,
        },
        take: 20,
      }),
    ])

    const serializedProducts = products.map(p => ({
      ...p,
      salePrice: p.salePrice.toNumber()
    }))

    const serializedSpareParts = spareParts.map(p => ({
      ...p,
      frontPanel: p.frontPanel?.toNumber() ?? null,
      panel: p.panel?.toNumber() ?? null,
      screenNonTouch: p.screenNonTouch?.toNumber() ?? null,
      screenTouch: p.screenTouch?.toNumber() ?? null,
      hinge: p.hinge?.toNumber() ?? null,
      touchPad: p.touchPad?.toNumber() ?? null,
      base: p.base?.toNumber() ?? null,
      keyboard: p.keyboard?.toNumber() ?? null,
      battery: p.battery?.toNumber() ?? null,
    }))

    return { products: serializedProducts, spareParts: serializedSpareParts }
  } catch (error) {
    console.error("Global Search Error:", error)
    return { products: [], spareParts: [], error: "Search failed" }
  }
}
