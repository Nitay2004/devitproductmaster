"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { validateName, validatePrice } from "@/lib/validation"

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
    const make = formData.get("make") as string
    const modelNumber = formData.get("modelNumber") as string
    const cpu = formData.get("cpu") as string
    const generation = formData.get("generation") as string
    const productName = formData.get("productName") as string
    const salePrice = parseFloat(formData.get("salePrice") as string)

    // Validation
    const makeVal = validateName(make)
    if (!makeVal.isValid) return { success: false, error: `Make: ${makeVal.error}` }
    
    const modelVal = validateName(modelNumber)
    if (!modelVal.isValid) return { success: false, error: `Model: ${modelVal.error}` }

    const priceVal = validatePrice(salePrice, "Sale Price")
    if (!priceVal.isValid) return { success: false, error: priceVal.error }

    const product = await prisma.product.create({
      data: {
        make,
        modelNumber,
        cpu: cpu || null,
        generation: generation || null,
        productName: productName || null,
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
    const make = formData.get("make") as string
    const modelNumber = formData.get("modelNumber") as string
    const cpu = formData.get("cpu") as string
    const generation = formData.get("generation") as string
    const productName = formData.get("productName") as string
    const salePrice = parseFloat(formData.get("salePrice") as string)

    // Validation
    const makeVal = validateName(make)
    if (!makeVal.isValid) return { success: false, error: `Make: ${makeVal.error}` }
    
    const modelVal = validateName(modelNumber)
    if (!modelVal.isValid) return { success: false, error: `Model: ${modelVal.error}` }

    const priceVal = validatePrice(salePrice, "Sale Price")
    if (!priceVal.isValid) return { success: false, error: priceVal.error }

    const product = await prisma.product.update({
      where: { id },
      data: {
        make,
        modelNumber,
        cpu: cpu || null,
        generation: generation || null,
        productName: productName || null,
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
