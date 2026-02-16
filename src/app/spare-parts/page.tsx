import DashboardLayout from "@/components/layout/dashboard-layout"
export const dynamic = 'force-dynamic'
import { getSpareParts } from "@/actions/spare-parts"
import { SparePartsClient } from "./spare-parts-client"

export default async function SparePartsPage() {
  const result = await getSpareParts()
  const spareParts = result.success && result.data ? result.data : []

  return (
    <DashboardLayout>
      <div className="p-6">
        <SparePartsClient initialSpareParts={spareParts} />
      </div>
    </DashboardLayout>
  )
}
