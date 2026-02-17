"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { schemaSparePart } from "@/lib/validation"

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
    const rawData = {
      make: formData.get("make"),
      modelNumber: formData.get("modelNumber"),
      cpu: formData.get("cpu"),
      generation: formData.get("generation"),
      productName: formData.get("productName"),
      frontPanel: formData.get("frontPanel"),
      panel: formData.get("panel"),
      screenNonTouch: formData.get("screenNonTouch"),
      screenTouch: formData.get("screenTouch"),
      hinge: formData.get("hinge"),
      touchPad: formData.get("touchPad"),
      base: formData.get("base"),
      keyboard: formData.get("keyboard"),
      battery: formData.get("battery"),
    }

    const validatedFields = schemaSparePart.safeParse(rawData)

    if (!validatedFields.success) {
      return { 
        success: false, 
        error: validatedFields.error.errors[0].message 
      }
    }

    const { 
      make, modelNumber, cpu, generation, productName,
      frontPanel, panel, screenNonTouch, screenTouch, 
      hinge, touchPad, base, keyboard, battery 
    } = validatedFields.data

    const part = await prisma.sparePart.create({
      data: {
        make,
        modelNumber,
        cpu: cpu || null,
        generation: generation || null,
        productName: productName || null,
        frontPanel: frontPanel || null,
        panel: panel || null,
        screenNonTouch: screenNonTouch || null,
        screenTouch: screenTouch || null,
        hinge: hinge || null,
        touchPad: touchPad || null,
        base: base || null,
        keyboard: keyboard || null,
        battery: battery || null,
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
    const rawData = {
      make: formData.get("make"),
      modelNumber: formData.get("modelNumber"),
      cpu: formData.get("cpu"),
      generation: formData.get("generation"),
      productName: formData.get("productName"),
      frontPanel: formData.get("frontPanel"),
      panel: formData.get("panel"),
      screenNonTouch: formData.get("screenNonTouch"),
      screenTouch: formData.get("screenTouch"),
      hinge: formData.get("hinge"),
      touchPad: formData.get("touchPad"),
      base: formData.get("base"),
      keyboard: formData.get("keyboard"),
      battery: formData.get("battery"),
    }

    const validatedFields = schemaSparePart.safeParse(rawData)

    if (!validatedFields.success) {
      return { 
        success: false, 
        error: validatedFields.error.errors[0].message 
      }
    }

    const { 
      make, modelNumber, cpu, generation, productName,
      frontPanel, panel, screenNonTouch, screenTouch, 
      hinge, touchPad, base, keyboard, battery 
    } = validatedFields.data

    const part = await prisma.sparePart.update({
      where: { id },
      data: {
        make,
        modelNumber,
        cpu: cpu || null,
        generation: generation || null,
        productName: productName || null,
        frontPanel: frontPanel || null,
        panel: panel || null,
        screenNonTouch: screenNonTouch || null,
        screenTouch: screenTouch || null,
        hinge: hinge || null,
        touchPad: touchPad || null,
        base: base || null,
        keyboard: keyboard || null,
        battery: battery || null,
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
