"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Package, Wrench } from "lucide-react"

interface ActivityItem {
  id: string
  type: string
  make: string
  modelNumber: string
  createdAt: string | Date
}

function RelativeTime({ date }: { date: string | Date }) {
  const dt = new Date(date)
  // Use a deterministic server/client initial string to avoid hydration mismatch
  const initial = dt.toUTCString()
  const [text, setText] = useState<string>(initial)

  useEffect(() => {
    const update = () => setText(formatDistanceToNow(dt, { addSuffix: true }))
    update()
    const id = setInterval(update, 60 * 1000)
    return () => clearInterval(id)
  }, [date])

  return <p className="text-xs text-muted-foreground">{text}</p>
}

export function RecentActivity({ activity }: { activity: ActivityItem[] }) {
  return (
    <Card className="col-span-1 shadow-sm border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activity.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity found.</p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${item.type === 'Product' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                  {item.type === 'Product' ? <Package className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Added {item.type}: <span className="text-blue-600">{item.make} {item.modelNumber}</span>
                  </p>
                  <RelativeTime date={item.createdAt} />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
