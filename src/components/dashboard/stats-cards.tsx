"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Laptop, Wrench, TrendingUp, Archive } from "lucide-react"

interface DashboardStats {
  totalInventory: number
  totalProducts: number
  totalSpareParts: number
  highValueProducts: number
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: "Total Inventory",
      value: stats.totalInventory,
      icon: Archive,
      description: "Items in Master",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Laptop Models",
      value: stats.totalProducts,
      icon: Laptop,
      description: "Products count",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Spare Parts",
      value: stats.totalSpareParts,
      icon: Wrench,
      description: "Components count",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Premium Products",
      value: stats.highValueProducts,
      icon: TrendingUp,
      description: "Items > ₹50,000",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="shadow-sm border-0 bg-white ring-1 ring-gray-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{card.value}</div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"></span>
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
