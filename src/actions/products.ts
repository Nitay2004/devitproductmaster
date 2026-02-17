"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { schemaProduct } from "@/lib/validation"

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        make: true,
        modelNumber: true,
        cpu: true,
        generation: true,
        productName: true,
        ram: true,
        ssd: true,
        hdd: true,
        salePrice: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })
    // Convert Decimal to number for client component compatibility
    const serializedProducts = products.map(product => ({
      id: product.id,
      make: product.make,
      modelNumber: product.modelNumber,
      cpu: product.cpu,
      generation: product.generation,
      productName: product.productName,
      ram: product.ram,
      ssd: product.ssd,
      hdd: product.hdd,
      salePrice: product.salePrice.toNumber(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }))
    return { success: true, data: serializedProducts }
  } catch (error) {
    console.error("Error fetching products:", error)
    return { success: false, error: "Failed to fetch products" }
  }
}

export async function addProduct(formData: FormData) {
  try {
    const rawData = {
      make: formData.get("make"),
      modelNumber: formData.get("modelNumber"),
      cpu: formData.get("cpu"),
      generation: formData.get("generation"),
      productName: formData.get("productName"),
      ram: formData.get("ram"),
      ssd: formData.get("ssd"),
      hdd: formData.get("hdd"),
      salePrice: formData.get("salePrice"),
    }

    const validatedFields = schemaProduct.safeParse(rawData)

    if (!validatedFields.success) {
      return { 
        success: false, 
        error: validatedFields.error.errors[0].message 
      }
    }

    const { make, modelNumber, cpu, generation, productName, ram, ssd, hdd, salePrice } = validatedFields.data

    const product = await prisma.product.create({
      data: {
        make,
        modelNumber,
        cpu: cpu || null,
        generation: generation || null,
        productName: productName || null,
        ram: ram || null,
        ssd: ssd || null,
        hdd: hdd || null,
        salePrice,
      },
    })

    revalidatePath("/products")
    revalidatePath("/")
    return { success: true, data: { ...product, salePrice: product.salePrice.toNumber() } }
  } catch (error) {
    console.error("Error adding product:", error)
    return { success: false, error: "Failed to add product" }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const rawData = {
      make: formData.get("make"),
      modelNumber: formData.get("modelNumber"),
      cpu: formData.get("cpu"),
      generation: formData.get("generation"),
      productName: formData.get("productName"),
      ram: formData.get("ram"),
      ssd: formData.get("ssd"),
      hdd: formData.get("hdd"),
      salePrice: formData.get("salePrice"),
    }

    const validatedFields = schemaProduct.safeParse(rawData)

    if (!validatedFields.success) {
      return { 
        success: false, 
        error: validatedFields.error.errors[0].message 
      }
    }

    const { make, modelNumber, cpu, generation, productName, ram, ssd, hdd, salePrice } = validatedFields.data

    const product = await prisma.product.update({
      where: { id },
      data: {
        make,
        modelNumber,
        cpu: cpu || null,
        generation: generation || null,
        productName: productName || null,
        ram: ram || null,
        ssd: ssd || null,
        hdd: hdd || null,
        salePrice,
      },
    })

    revalidatePath("/products")
    revalidatePath("/")
    return { success: true, data: { ...product, salePrice: product.salePrice.toNumber() } }
  } catch (error) {
    console.error("Error updating product:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export async function updateProductPrice(id: string, salePrice: number) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { salePrice },
    })

    revalidatePath("/products")
    revalidatePath("/")
    return { success: true, data: { ...product, salePrice: product.salePrice.toNumber() } }
  } catch (error) {
    console.error("Error updating product price:", error)
    return { success: false, error: "Failed to update price" }
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    })

    revalidatePath("/products")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

export async function bulkDeleteProducts(ids: string[]) {
  try {
    await prisma.product.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    revalidatePath("/products")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error bulk deleting products:", error)
    return { success: false, error: "Failed to delete selected products" }
  }
}

export async function getProductStats() {
  try {
    const totalProducts = await prisma.product.count()
    const highValueItems = await prisma.product.count({
      where: {
        salePrice: {
          gt: 50000 // Sample threshold for high value items
        }
      }
    })
    
    // Most expensive product
    const expensiveProduct = await prisma.product.findFirst({
      orderBy: { salePrice: 'desc' },
      select: { make: true, modelNumber: true, salePrice: true }
    })

    return {
      success: true,
      data: {
        totalProducts,
        highValueItems,
        expensiveProduct: expensiveProduct ? {
          ...expensiveProduct,
          salePrice: expensiveProduct.salePrice.toNumber()
        } : null
      }
    }
  } catch (error) {
    console.error("Error fetching product stats:", error)
    return { success: false, error: "Failed to fetch product stats" }
  }
}
