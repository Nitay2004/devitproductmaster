"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { validateName, validatePrice } from "@/lib/validation"

export async function getSpareParts() {
  try {
    const spareParts = await prisma.sparePart.findMany({
      orderBy: { createdAt: 'desc' }
    })
    // Convert Decimal to number for client component compatibility
    const serializedSpareParts = spareParts.map(part => ({
      id: part.id,
      make: part.make,
      modelNumber: part.modelNumber,
      cpu: part.cpu,
      generation: part.generation,
      productName: part.productName,
      frontPanel: part.frontPanel?.toNumber() ?? null,
      panel: part.panel?.toNumber() ?? null,
      screenNonTouch: part.screenNonTouch?.toNumber() ?? null,
      screenTouch: part.screenTouch?.toNumber() ?? null,
      hinge: part.hinge?.toNumber() ?? null,
      touchPad: part.touchPad?.toNumber() ?? null,
      base: part.base?.toNumber() ?? null,
      keyboard: part.keyboard?.toNumber() ?? null,
      battery: part.battery?.toNumber() ?? null,
      createdAt: part.createdAt.toISOString(),
      updatedAt: part.updatedAt.toISOString(),
    }))
    return { success: true, data: serializedSpareParts }
  } catch (error) {
    console.error("Error fetching spare parts:", error)
    return { success: false, error: "Failed to fetch spare parts" }
  }
}

export async function addSparePart(formData: FormData) {
  try {
    const make = formData.get("make") as string
    const modelNumber = formData.get("modelNumber") as string
    const cpu = formData.get("cpu") as string
    const generation = formData.get("generation") as string
    const productName = formData.get("productName") as string

    // Validation
    const makeVal = validateName(make)
    if (!makeVal.isValid) return { success: false, error: `Make: ${makeVal.error}` }
    
    const modelVal = validateName(modelNumber)
    if (!modelVal.isValid) return { success: false, error: `Model: ${modelVal.error}` }

    const priceFields = [
        "frontPanel", "panel", "screenNonTouch", "screenTouch", 
        "hinge", "touchPad", "base", "keyboard", "battery"
    ]

    const getDecimal = (key: string) => {
        const val = formData.get(key)
        const num = val ? parseFloat(val as string) : null
        
        if (num !== null) {
            const valResult = validatePrice(num, key.replace(/([A-Z])/g, ' $1').trim())
            if (!valResult.isValid) throw new Error(valResult.error)
        }
        
        return num
    }

    const part = await prisma.sparePart.create({
      data: {
        make,
        modelNumber,
        cpu: cpu || null,
        generation: generation || null,
        productName: productName || null,
        frontPanel: getDecimal("frontPanel"),
        panel: getDecimal("panel"),
        screenNonTouch: getDecimal("screenNonTouch"),
        screenTouch: getDecimal("screenTouch"),
        hinge: getDecimal("hinge"),
        touchPad: getDecimal("touchPad"),
        base: getDecimal("base"),
        keyboard: getDecimal("keyboard"),
        battery: getDecimal("battery"),
      },
    })

    revalidatePath("/spare-parts")
    return { 
      success: true, 
      data: {
        id: part.id,
        make: part.make,
        modelNumber: part.modelNumber,
        cpu: part.cpu,
        generation: part.generation,
        productName: part.productName,
        frontPanel: part.frontPanel?.toNumber() ?? null,
        panel: part.panel?.toNumber() ?? null,
        screenNonTouch: part.screenNonTouch?.toNumber() ?? null,
        screenTouch: part.screenTouch?.toNumber() ?? null,
        hinge: part.hinge?.toNumber() ?? null,
        touchPad: part.touchPad?.toNumber() ?? null,
        base: part.base?.toNumber() ?? null,
        keyboard: part.keyboard?.toNumber() ?? null,
        battery: part.battery?.toNumber() ?? null,
        createdAt: part.createdAt.toISOString(),
        updatedAt: part.updatedAt.toISOString(),
      } 
    }
  } catch (error) {
    console.error("Error adding spare part:", error instanceof Error ? error.message : error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to add spare part" }
  }
}

export async function updateSparePart(id: string, formData: FormData) {
  try {
    const make = formData.get("make") as string
    const modelNumber = formData.get("modelNumber") as string
    const cpu = formData.get("cpu") as string
    const generation = formData.get("generation") as string
    const productName = formData.get("productName") as string

    // Validation
    const makeVal = validateName(make)
    if (!makeVal.isValid) return { success: false, error: `Make: ${makeVal.error}` }
    
    const modelVal = validateName(modelNumber)
    if (!modelVal.isValid) return { success: false, error: `Model: ${modelVal.error}` }

    const getDecimal = (key: string) => {
        const val = formData.get(key)
        const num = val ? parseFloat(val as string) : null
        
        if (num !== null) {
            const valResult = validatePrice(num, key.replace(/([A-Z])/g, ' $1').trim())
            if (!valResult.isValid) throw new Error(valResult.error)
        }
        
        return num
    }

    const part = await prisma.sparePart.update({
      where: { id },
      data: {
        make,
        modelNumber,
        cpu: cpu || null,
        generation: generation || null,
        productName: productName || null,
        frontPanel: getDecimal("frontPanel"),
        panel: getDecimal("panel"),
        screenNonTouch: getDecimal("screenNonTouch"),
        screenTouch: getDecimal("screenTouch"),
        hinge: getDecimal("hinge"),
        touchPad: getDecimal("touchPad"),
        base: getDecimal("base"),
        keyboard: getDecimal("keyboard"),
        battery: getDecimal("battery"),
      },
    })

    revalidatePath("/spare-parts")
    return { success: true }
  } catch (error) {
    console.error("Error updating spare part:", error instanceof Error ? error.message : error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update spare part" }
  }
}

export async function deleteSparePart(id: string) {
  try {
    await prisma.sparePart.delete({
      where: { id },
    })

    revalidatePath("/spare-parts")
    return { success: true }
  } catch (error) {
    console.error("Error deleting spare part:", error)
    return { success: false, error: "Failed to delete spare part" }
  }
}

export async function bulkDeleteSpareParts(ids: string[]) {
  try {
    await prisma.sparePart.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    revalidatePath("/spare-parts")
    return { success: true }
  } catch (error) {
    console.error("Error bulk deleting spare parts:", error)
    return { success: false, error: "Failed to delete selected spare parts" }
  }
}
