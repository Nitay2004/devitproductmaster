"use server"

import { prisma } from "@/lib/prisma"

export async function getDashboardData() {
  try {
    // 1. Fetch Product Stats
    const totalProducts = await prisma.product.count()
    const highValueProducts = await prisma.product.count({
      where: { salePrice: { gt: 50000 } }
    })
    
    // 2. Fetch Spare Parts Stats
    const totalSpareParts = await prisma.sparePart.count()
    
    // 3. Recent Activity (Latest 5 items from both)
    const recentProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        make: true,
        modelNumber: true,
        createdAt: true,
      }
    })

    const recentSpareParts = await prisma.sparePart.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        make: true,
        modelNumber: true,
        createdAt: true,
      }
    })

    // Combine and sort by date
    const activity = [
      ...recentProducts.map(p => ({ ...p, type: 'Product' })),
      ...recentSpareParts.map(s => ({ ...s, type: 'Spare Part' }))
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
     .slice(0, 5)

    return {
      success: true,
      data: {
        stats: {
          totalProducts,
          highValueProducts,
          totalSpareParts,
          totalInventory: totalProducts + totalSpareParts
        },
        recentActivity: activity
      }
    }
  } catch (error) {
    console.error("Dashboard Data Error:", error)
    return { success: false, error: "Failed to fetch dashboard data" }
  }
}
