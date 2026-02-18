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
    frontPanel: ['frontpanel(bazel)', 'frontpanelbazel', 'bazel', 'frontpanel'],
    panel: ['panel'],
    screenNonTouch: ['screennontouch', 'screen-nontouch', 'screen-non-touch', 'displaynontouch', 'screen'],
    screenTouch: ['screentouch', 'screen-touch', 'displaytouch'],
    hinge: ['hinge'],
    touchPad: ['touchpad', 'touchpad', 'touch pad'],
    base: ['base'],
    keyboard: ['keyboard'],
    battery: ['battery', 'batt'],
    ram: ['ram', 'memory'],
    hdd: ['hdd', 'harddrive'],
    ssd: ['ssd', 'solidstatedrive'],
  };

  if (aliases[target]) {
    for (const key in item) {
      const k = key.toLowerCase().replace(/\s+/g, '').replace(/[-_.]/g, '');
      const normalizedTargetAlts = aliases[target].map(a => a.toLowerCase().replace(/\s+/g, '').replace(/[-_.]/g, ''));
      if (normalizedTargetAlts.includes(k)) return item[key];
    }
  }

  return undefined;
}

export async function bulkUploadProducts(data: RawExcelData[]) {
  try {
    const formattedData = data.map(item => {
      const getNum = (key: string) => {
        const val = findValue(item, key);
        if (val === undefined || val === null || val === "") return 0;
        const num = parseFloat(String(val));
        return isNaN(num) ? 0 : num;
      };

      return {
        make: String(findValue(item, 'make') || ""),
        modelNumber: String(findValue(item, 'modelNumber') || ""),
        cpu: findValue(item, 'cpu') ? String(findValue(item, 'cpu')) : null,
        generation: findValue(item, 'generation') ? String(findValue(item, 'generation')) : null,
        productName: findValue(item, 'productName') ? String(findValue(item, 'productName')) : "Laptop",
        ram: findValue(item, 'ram') ? String(findValue(item, 'ram')) : null,
        ssd: findValue(item, 'ssd') ? String(findValue(item, 'ssd')) : null,
        hdd: findValue(item, 'hdd') ? String(findValue(item, 'hdd')) : null,
        salePrice: getNum('salePrice'),
      };
    }).filter(item => item.make && item.modelNumber);

    if (formattedData.length === 0) {
      return { success: false, error: "No valid data found in file. Please ensure 'Make' and 'Model Number' columns exist." }
    }

    const result = await prisma.product.createMany({
      data: formattedData,
      skipDuplicates: false
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
      const cpu = findValue(item, 'cpu');
      const generation = findValue(item, 'generation');
      const productName = findValue(item, 'productName');
      
      const getNum = (key: string) => {
        const val = findValue(item, key);
        if (val === undefined || val === null || val === "") return null;
        const num = parseFloat(String(val));
        return isNaN(num) ? null : num;
      };

      return {
        make: String(findValue(item, 'make') || ""),
        modelNumber: String(findValue(item, 'modelNumber') || ""),
        cpu: cpu ? String(cpu) : null,
        generation: generation ? String(generation) : null,
        productName: productName ? String(productName) : "Laptop",
        frontPanel: getNum('frontPanel'),
        panel: getNum('panel'),
        screenNonTouch: getNum('screenNonTouch'),
        screenTouch: getNum('screenTouch'),
        hinge: getNum('hinge'),
        touchPad: getNum('touchPad'),
        base: getNum('base'),
        keyboard: getNum('keyboard'),
        battery: getNum('battery'),
      };
    }).filter(item => item.make && item.modelNumber);

    if (formattedData.length === 0) {
      return { success: false, error: "No valid data found in file. Please ensure 'Make' and 'Model Number' columns exist." }
    }

    const result = await prisma.sparePart.createMany({
      data: formattedData,
      skipDuplicates: false
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
