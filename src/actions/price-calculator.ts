"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

// Lookup by productName (format: Make/Model/CPU/Gen)
export async function getProductByProductName(productName: string) {
  try {
    // Try exact match (case-insensitive) first
    let product = await prisma.product.findFirst({
      where: { productName: { equals: productName, mode: 'insensitive' } }
    })
    
    // Fallback: parse productName and match fields case-insensitively
    if (!product) {
      const parts = productName.split("/").map(p => p.trim())
      const [make, modelNumber, cpu, generation] = parts
      if (make && modelNumber) {
        product = await prisma.product.findFirst({
          where: {
            make: { equals: make, mode: 'insensitive' },
            modelNumber: { equals: modelNumber, mode: 'insensitive' },
            cpu: cpu ? { equals: cpu, mode: 'insensitive' } : null,
            generation: generation ? { equals: generation, mode: 'insensitive' } : null,
          }
        })
      }
    }

    if (product) {
      return { 
        success: true, 
        data: { 
          ...product, 
          salePrice: Number(product.salePrice),
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        } 
      }
    }
    return { success: false, error: "Product not found" }
  } catch (error) {
    console.error("Error fetching product:", error)
    return { success: false, error: "Failed to fetch product" }
  }
}

export async function getSparePartByProductName(productName: string) {
  try {
    // Try exact match (case-insensitive)
    let sparePart = await prisma.sparePart.findFirst({
      where: { productName: { equals: productName, mode: 'insensitive' } }
    })

    if (!sparePart) {
      const parts = productName.split("/").map(p => p.trim())
      const [make, modelNumber, cpu, generation] = parts
      if (make && modelNumber) {
        sparePart = await prisma.sparePart.findFirst({
          where: {
            make: { equals: make, mode: 'insensitive' },
            modelNumber: { equals: modelNumber, mode: 'insensitive' },
            cpu: cpu ? { equals: cpu, mode: 'insensitive' } : null,
            generation: generation ? { equals: generation, mode: 'insensitive' } : null,
          }
        })
      }
    }

    if (sparePart) {
      return {
        success: true,
        data: {
          frontPanel: sparePart.frontPanel?.toNumber() || 0,
          panel: sparePart.panel?.toNumber() || 0,
          screenNonTouch: sparePart.screenNonTouch?.toNumber() || 0,
          screenTouch: sparePart.screenTouch?.toNumber() || 0,
          hinge: sparePart.hinge?.toNumber() || 0,
          touchPad: sparePart.touchPad?.toNumber() || 0,
          base: sparePart.base?.toNumber() || 0,
          keyboard: sparePart.keyboard?.toNumber() || 0,
          battery: sparePart.battery?.toNumber() || 0,
        },
      }
    }
    return { success: false, error: "Spare parts not found" }
  } catch (error) {
    console.error("Error fetching spare parts:", error)
    return { success: false, error: "Failed to fetch spare parts" }
  }
}

// Keep old functions for compatibility
export async function getProductByDetails(make: string, modelNumber: string, cpu?: string, generation?: string) {
  try {
    let product = await prisma.product.findFirst({
      where: { make, modelNumber, cpu: cpu || null, generation: generation || null },
    })
    if (!product) product = await prisma.product.findFirst({ where: { modelNumber } })
    if (product) {
      return { 
        success: true, 
        data: { 
          ...product, 
          salePrice: Number(product.salePrice),
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        } 
      }
    }
    return { success: false, error: "Product not found" }
  } catch (error) {
    return { success: false, error: "Failed to fetch product" }
  }
}

export async function getSparePartPrices(make: string, modelNumber: string, cpu?: string, generation?: string) {
  try {
    let sparePart = await prisma.sparePart.findFirst({
      where: { make, modelNumber, cpu: cpu || null, generation: generation || null },
    })
    if (!sparePart) sparePart = await prisma.sparePart.findFirst({ where: { modelNumber } })
    if (sparePart) {
      return {
        success: true,
        data: {
          frontPanel: sparePart.frontPanel?.toNumber() || 0,
          panel: sparePart.panel?.toNumber() || 0,
          screenNonTouch: sparePart.screenNonTouch?.toNumber() || 0,
          screenTouch: sparePart.screenTouch?.toNumber() || 0,
          hinge: sparePart.hinge?.toNumber() || 0,
          touchPad: sparePart.touchPad?.toNumber() || 0,
          base: sparePart.base?.toNumber() || 0,
          keyboard: sparePart.keyboard?.toNumber() || 0,
          battery: sparePart.battery?.toNumber() || 0,
        },
      }
    }
    return { success: false, error: "Spare parts not found" }
  } catch (error) {
    return { success: false, error: "Failed to fetch spare parts" }
  }
}

// Helper to serialize Prisma objects for Client Components
function serializeCalc(c: any) {
  if (!c) return null
  return {
    id: c.id,
    productName: c.productName,
    tagNo: c.tagNo,
    grade: c.grade,
    lotNumber: c.lotNumber,
    make: c.make,
    modelNumber: c.modelNumber,
    cpu: c.cpu,
    generation: c.generation,
    ramPresent: c.ramPresent,
    ramCapacity: c.ramCapacity,
    hddPresent: c.hddPresent,
    hdd: c.hdd,
    ssdPresent: c.ssdPresent,
    ssd: c.ssd,
    frontPanel: c.frontPanel,
    frontPanelCost: Number(c.frontPanelCost || 0),
    panel: c.panel,
    panelCost: Number(c.panelCost || 0),
    screenNonTouch: c.screenNonTouch,
    screenNonTouchCost: Number(c.screenNonTouchCost || 0),
    screenTouch: c.screenTouch,
    screenTouchCost: Number(c.screenTouchCost || 0),
    hinge: c.hinge,
    hingeCost: Number(c.hingeCost || 0),
    touchPad: c.touchPad,
    touchPadCost: Number(c.touchPadCost || 0),
    base: c.base,
    baseCost: Number(c.baseCost || 0),
    keyboard: c.keyboard,
    keyboardCost: Number(c.keyboardCost || 0),
    battery: c.battery,
    batteryCost: Number(c.batteryCost || 0),
    repairCost: Number(c.repairCost || 0),
    salePrice: Number(c.salePrice || 0),
    suggestedSalePrice: Number(c.suggestedSalePrice || 0),
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
  }
}

export async function getPriceCalculations() {
  try {
    const calculations = await prisma.priceCalculator.findMany({ orderBy: { createdAt: "desc" } })
    return {
      success: true,
      data: calculations.map(serializeCalc),
    }
  } catch (error) {
    console.error("Error fetching calculations:", error)
    return { success: false, error: "Failed to fetch calculations" }
  }
}

export type CalcData = {
  productName: string
  tagNo?: string | null
  grade?: string | null
  lotNumber?: string | null
  make?: string | null
  modelNumber?: string | null
  cpu?: string | null
  generation?: string | null
  ramPresent: boolean
  ramCapacity?: string | null
  hddPresent: boolean
  hdd?: string | null
  ssdPresent: boolean
  ssd?: string | null
  frontPanel: string
  frontPanelCost?: number
  panel: string
  panelCost?: number
  screenNonTouch: string
  screenNonTouchCost?: number
  screenTouch: string
  screenTouchCost?: number
  hinge: string
  hingeCost?: number
  touchPad: string
  touchPadCost?: number
  base: string
  baseCost?: number
  keyboard: string
  keyboardCost?: number
  battery: string
  batteryCost?: number
  repairCost: number
  salePrice: number
  suggestedSalePrice: number
}

export async function addPriceCalculation(data: CalcData) {
  try {
    if (!data.productName) return { success: false, error: "Product Name is required" }
    const result = await prisma.priceCalculator.create({ data })
    revalidatePath("/price-calculator")
    return {
      success: true,
      data: serializeCalc(result),
    }
  } catch (error) {
    console.error("Error adding calculation:", error)
    return { success: false, error: "Failed to add calculation" }
  }
}

export async function updatePriceCalculation(id: string, data: CalcData) {
  try {
    if (!data.productName) return { success: false, error: "Product Name is required" }
    const result = await prisma.priceCalculator.update({ where: { id }, data })
    revalidatePath("/price-calculator")
    return {
      success: true,
      data: serializeCalc(result),
    }
  } catch (error) {
    console.error("Error updating calculation:", error)
    return { success: false, error: "Failed to update calculation" }
  }
}

export async function deletePriceCalculation(id: string) {
  try {
    await prisma.priceCalculator.delete({ where: { id } })
    revalidatePath("/price-calculator")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete calculation" }
  }
}

export async function bulkDeletePriceCalculations(ids: string[]) {
  try {
    await prisma.priceCalculator.deleteMany({ where: { id: { in: ids } } })
    revalidatePath("/price-calculator")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete calculations" }
  }
}

type RawExcelData = Record<string, unknown>

function findVal(item: RawExcelData, ...targets: string[]): unknown {
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "").replace(/[-_.]/g, "").replace(/[()]/g, "");
  const normTargets = targets.map(normalize);
  
  for (const key in item) {
    const k = normalize(key);
    if (normTargets.includes(k)) return item[key];
  }
  return undefined;
}

function normalizeStatus(val: unknown): string {
  if (!val) return "ok"
  const s = String(val).trim().toLowerCase()
  if (s === "ok" || s === "" || s === "0") return "ok"
  return s
}

export async function bulkUploadPriceCalculations(data: RawExcelData[]) {
  try {
    const results = []
    for (const item of data) {
      const productName = String(findVal(item, "productName", "product name", "product") || "")
      if (!productName) continue

      // Fetch from masters with robust logic
      const productRes = await getProductByProductName(productName)
      const spareRes = await getSparePartByProductName(productName)

      const productResult = productRes.success ? productRes.data : null
      const spareResult = spareRes.success ? spareRes.data : null

      const salePrice = productResult ? (productResult.salePrice as number) : 0
      const ramCapacity = productResult?.ram || null
      const hdd = productResult?.hdd || null
      const ssd = productResult?.ssd || null

      const frontPanel = normalizeStatus(findVal(item, "frontPanel", "front panel", "bazel", "front panel(bazel)"))
      const panel = normalizeStatus(findVal(item, "panel"))
      const screen = normalizeStatus(findVal(item, "screen", "display"))
      const screenNonTouch = screen
      const screenTouch = screen
      const hinge = normalizeStatus(findVal(item, "hinge"))
      const touchPad = normalizeStatus(findVal(item, "touchPad", "touch pad", "touchpad"))
      const base = normalizeStatus(findVal(item, "base"))
      const keyboard = normalizeStatus(findVal(item, "keyboard"))
      const battery = normalizeStatus(findVal(item, "battery", "batt"))

      const sp = spareResult
      const frontPanelCost = frontPanel !== "ok" ? (sp?.frontPanel || 0) : 0
      const panelCost = panel !== "ok" ? (sp?.panel || 0) : 0
      const screenNonTouchCost = screenNonTouch !== "ok" ? (sp?.screenNonTouch || 0) : 0
      const screenTouchCost = screenTouch !== "ok" ? (sp?.screenTouch || 0) : 0
      const hingeCost = hinge !== "ok" ? (sp?.hinge || 0) : 0
      const touchPadCost = touchPad !== "ok" ? (sp?.touchPad || 0) : 0
      const baseCost = base !== "ok" ? (sp?.base || 0) : 0
      const keyboardCost = keyboard !== "ok" ? (sp?.keyboard || 0) : 0
      const batteryCost = battery !== "ok" ? (sp?.battery || 0) : 0

      const repairCost = [
        frontPanelCost,
        panelCost,
        screenNonTouchCost,
        screenTouchCost,
        hingeCost,
        touchPadCost,
        baseCost,
        keyboardCost,
        batteryCost,
      ].reduce((a, b) => a + b, 0)

      const suggestedSalePrice = salePrice - repairCost

      const rawRam = findVal(item, "ram", "ramCapacity", "ram capacity", "memory")
      const rawHdd = findVal(item, "hdd", "harddrive", "hard drive")
      const rawSsd = findVal(item, "ssd", "solidstatedrive", "solid state drive")

      const isPresent = (val: unknown) => {
        if (val === undefined || val === null || val === "") return false
        const s = String(val).toLowerCase().trim()
        return s !== "no" && s !== "missing" && s !== "false" && s !== "0" && s !== "none"
      }

      results.push({
        productName,
        tagNo: String(findVal(item, "tagNo", "tag no", "tag") || "") || null,
        grade: String(findVal(item, "grade") || "") || null,
        lotNumber: String(findVal(item, "lotNumber", "lot number", "lot no") || "") || null,
        make: productResult?.make || String(findVal(item, "make") || "") || null,
        modelNumber: productResult?.modelNumber || String(findVal(item, "modelNumber", "model number", "model") || "") || null,
        cpu: productResult?.cpu || String(findVal(item, "cpu") || "") || null,
        generation: productResult?.generation || String(findVal(item, "generation", "gen") || "") || null,
        ramPresent: productResult ? true : isPresent(rawRam),
        ramCapacity: ramCapacity || (isPresent(rawRam) ? String(rawRam) : null),
        hddPresent: productResult ? true : isPresent(rawHdd),
        hdd: hdd || (isPresent(rawHdd) ? String(rawHdd) : null),
        ssdPresent: productResult ? !!ssd : isPresent(rawSsd),
        ssd: ssd || (isPresent(rawSsd) ? String(rawSsd) : null),
        frontPanel,
        frontPanelCost,
        panel,
        panelCost,
        screenNonTouch,
        screenNonTouchCost,
        screenTouch,
        screenTouchCost,
        hinge,
        hingeCost,
        touchPad,
        touchPadCost,
        base,
        baseCost,
        keyboard,
        keyboardCost,
        battery,
        batteryCost,
        repairCost,
        salePrice,
        suggestedSalePrice,
      })
    }

    if (results.length === 0) {
      return { success: false, error: "No valid data found. Ensure 'Product Name' column exists." }
    }

    const result = await prisma.priceCalculator.createMany({ data: results, skipDuplicates: false })
    revalidatePath("/price-calculator")
    return { success: true, count: result.count }
  } catch (error) {
    console.error("Bulk upload error:", error)
    return { success: false, error: "Failed to bulk upload calculations" }
  }
}
