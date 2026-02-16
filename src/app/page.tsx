import DashboardLayout from "@/components/layout/dashboard-layout"
export const dynamic = 'force-dynamic'
import { getDashboardData } from "@/actions/dashboard"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Package, Wrench } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const result = await getDashboardData()
  const data = result.success && result.data ? result.data : {
    stats: { totalProducts: 0, highValueProducts: 0, totalSpareParts: 0, totalInventory: 0 },
    recentActivity: []
  }

  return (
    <DashboardLayout>
       <div className="py-4 md:py-8 space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 font-outfit">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Monitoring your Product Master and inventory status.</p>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 w-full sm:w-auto">
               <Button asChild variant="outline" className="flex-1 sm:flex-none border-blue-200 text-blue-600 hover:bg-blue-50 text-xs md:text-sm">
                  <Link href="/products" className="flex items-center gap-2">
                    <Package className="h-4 w-4" /> Manage Products
                  </Link>
               </Button>
               <Button asChild className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm">
                  <Link href="/spare-parts" className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" /> Manage Spare Parts
                  </Link>
               </Button>
            </div>
          </div>

          <StatsCards stats={data.stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RecentActivity activity={data.recentActivity} />
            </div>
            
            <div className="space-y-6">
              <Card className="border-0 shadow-sm ring-1 ring-gray-100 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-blue-100 text-sm">Need to add new inventory? Use the direct links below or the sidebar.</p>
                  <div className="grid gap-2">
                    <Button asChild size="sm" variant="secondary" className="justify-between group">
                      <Link href="/products">
                        Add New product <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="secondary" className="justify-between group">
                      <Link href="/spare-parts">
                        Add Spare Part <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm ring-1 ring-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg">System Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Database Status</span>
                    <span className="flex items-center gap-1.5 text-green-600 font-medium whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-4">
                    <span className="text-gray-500">Environment</span>
                    <span className="text-blue-600 font-medium">Turbopack Dev</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
       </div>
    </DashboardLayout>
  );
}

