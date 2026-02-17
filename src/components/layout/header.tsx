"use client"

import Link from "next/link"
import React from "react"
import { GlobalSearch } from "@/components/dashboard/global-search"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserButton } from "./user-button"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <div className="border-b bg-slate-50/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 md:px-8 w-full gap-4">
        {/* Mobile Toggle */}
        <div className="lg:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-600 hover:bg-slate-100 rounded-xl"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Logo Section */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl text-primary hover:opacity-80 transition-opacity">
            <span className="hidden sm:inline bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">ProductMaster</span>
          </Link>
        </div>

        {/* Center Search Section */}
        <div className="flex-1 flex justify-center max-w-2xl mx-auto px-2">
          <GlobalSearch />
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-3 shrink-0">
          <UserButton showLabel={false} />
        </div>
      </div>
    </div>
  )
}
