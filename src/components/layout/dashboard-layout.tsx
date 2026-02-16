"use client"

import { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMenuClick={() => setIsMobileOpen(true)} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <Sidebar 
          isCollapsed={isCollapsed} 
          onMouseEnter={() => {
            if (window.innerWidth >= 1024) setIsCollapsed(false)
          }}
          onMouseLeave={() => {
            if (window.innerWidth >= 1024) setIsCollapsed(true)
          }}
          className="hidden lg:flex shrink-0 animate-in fade-in slide-in-from-left duration-300 min-h-full" 
        />

        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-blue-600 border-r-blue-700">
            <div className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </div>
            <Sidebar 
              isCollapsed={false} 
              onMouseEnter={() => {}} 
              onMouseLeave={() => {}}
              className="flex w-full h-full border-none shadow-none"
            />
          </SheetContent>
        </Sheet>

        <main className="flex-1 bg-gray-50 overflow-y-auto overflow-x-hidden">
          <div className="p-4 md:p-6 lg:p-10 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
