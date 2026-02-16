"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

type RawExcelData = Record<string, unknown>;

function findValue(item: RawExcelData, target: string) {
  const normalizedTarget = target.toLowerCase().replace(/\s+/g, '');
  
  // 1. Direct match with normalization
  for (const key in item) {
    if (key.toLowerCase().replace(/\s+/g, '') === normalizedTarget) {
      return item[key];
    }
  }

  // 2. Common aliases
  const aliases: Record<string, string[]> = {
    make: ['brand', 'manufacturer', 'mfr'],
    modelNumber: ['model', 'modelno', 'modelnumber', 'sku', 'partnumber'],
    productName: ['name', 'description', 'title', 'product'],
    salePrice: ['price', 'mrp', 'cost', 'sellingprice', 'rate'],
  };

  if (aliases[target]) {
    for (const key in item) {
      const k = key.toLowerCase().replace(/\s+/g, '');
      if (aliases[target].includes(k)) return item[key];
    }
  }

  return undefined;
}

export async function bulkUploadProducts(data: RawExcelData[]) {
  try {
    const formattedData = data.map(item => {
      const make = findValue(item, 'make');
      const modelNumber = findValue(item, 'modelNumber');
      const cpu = findValue(item, 'cpu');
      const generation = findValue(item, 'generation');
      const productName = findValue(item, 'productName');
      const salePrice = findValue(item, 'salePrice');

      return {
        make: String(make || ""),
        modelNumber: String(modelNumber || ""),
        cpu: cpu ? String(cpu) : null,
        generation: generation ? String(generation) : null,
        productName: productName ? String(productName) : "Laptop",
        salePrice: parseFloat(String(salePrice || 0)),
      };
    }).filter(item => item.make && item.modelNumber);

    if (formattedData.length === 0) {
      return { success: false, error: "No valid data found in file. Please ensure 'Make' and 'Model Number' columns exist." }
    }

    const result = await prisma.product.createMany({
      data: formattedData,
      skipDuplicates: true
    })

    revalidatePath("/products")
    revalidatePath("/")
    return { success: true, count: result.count }
  } catch (error: unknown) {
    console.error("Bulk Upload Products Error:", error)
    const err = error as { code?: string; message?: string };
    let errorMessage = "Failed to upload products"
    if (err.code === 'P2002') {
      errorMessage = "Conflicting data found: One or more model numbers already exist."
    } else if (err.message) {
      errorMessage = `Database Error: ${err.message.split('\n').pop()}`
    }
    return { success: false, error: errorMessage }
  }
}

export async function bulkUploadSpareParts(data: RawExcelData[]) {
  try {
    const formattedData = data.map(item => {
      const make = findValue(item, 'make');
      const modelNumber = findValue(item, 'modelNumber');
      const cpu = findValue(item, 'cpu');
      const generation = findValue(item, 'generation');
      const productName = findValue(item, 'productName');
      
      return {
        make: String(make || ""),
        modelNumber: String(modelNumber || ""),
        cpu: cpu ? String(cpu) : null,
        generation: generation ? String(generation) : null,
        productName: productName ? String(productName) : "Laptop",
        frontPanel: findValue(item, 'frontPanel') ? parseFloat(String(findValue(item, 'frontPanel'))) : null,
        panel: findValue(item, 'panel') ? parseFloat(String(findValue(item, 'panel'))) : null,
        screenNonTouch: findValue(item, 'screenNonTouch') ? parseFloat(String(findValue(item, 'screenNonTouch'))) : null,
        screenTouch: findValue(item, 'screenTouch') ? parseFloat(String(findValue(item, 'screenTouch'))) : null,
        hinge: findValue(item, 'hinge') ? parseFloat(String(findValue(item, 'hinge'))) : null,
        touchPad: findValue(item, 'touchPad') ? parseFloat(String(findValue(item, 'touchPad'))) : null,
        base: findValue(item, 'base') ? parseFloat(String(findValue(item, 'base'))) : null,
        keyboard: findValue(item, 'keyboard') ? parseFloat(String(findValue(item, 'keyboard'))) : null,
        battery: findValue(item, 'battery') ? parseFloat(String(findValue(item, 'battery'))) : null,
      };
    }).filter(item => item.make && item.modelNumber);

    if (formattedData.length === 0) {
      return { success: false, error: "No valid data found in file. Please ensure 'Make' and 'Model Number' columns exist." }
    }

    const result = await prisma.sparePart.createMany({
      data: formattedData,
      skipDuplicates: true
    })

    revalidatePath("/spare-parts")
    return { success: true, count: result.count }
  } catch (error: unknown) {
    console.error("Bulk Upload Spare Parts Error:", error)
    const err = error as { code?: string; message?: string };
    let errorMessage = "Failed to upload spare parts"
    if (err.code === 'P2002') {
      errorMessage = "Conflicting data found: One or more model numbers already exist."
    } else if (err.message) {
      errorMessage = `Database Error: ${err.message.split('\n').pop()}`
    }
    return { success: false, error: errorMessage }
  }
}
