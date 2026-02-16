import DashboardLayout from "@/components/layout/dashboard-layout"
export const dynamic = 'force-dynamic'
import { getProducts } from "@/actions/products"
import { ProductsClient } from "./products-client"

export default async function ProductsPage() {
  const result = await getProducts()
  const products = result.success && result.data ? result.data : []

  return (
    <DashboardLayout>
      <div className="p-6">
        <ProductsClient initialProducts={products} />
      </div>
    </DashboardLayout>
  )
}
