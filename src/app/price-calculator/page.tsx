import DashboardLayout from "@/components/layout/dashboard-layout"
import { PriceCalculatorClient } from "./price-calculator-client"
import { getPriceCalculations } from "@/actions/price-calculator"

export default async function PriceCalculatorPage() {
  const result = await getPriceCalculations()
  const initialCalculations = result.success ? result.data : []
  
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <PriceCalculatorClient initialCalculations={initialCalculations as any} />
      </div>
    </DashboardLayout>
  )
}
