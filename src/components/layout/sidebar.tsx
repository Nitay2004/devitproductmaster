"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Package,
  Wrench,
  LogOut,
} from "lucide-react"
import { logout } from "@/actions/auth"
import { UserButton } from "./user-button"
import { motion, AnimatePresence, Variants } from "framer-motion"

interface SidebarProps {
  className?: string
  isCollapsed: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function Sidebar({ className, isCollapsed, onMouseEnter, onMouseLeave }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Products", icon: Package, href: "/products" },
    { name: "Spare Parts", icon: Wrench, href: "/spare-parts" },
  ]

  // Animation variants for the sidebar container
  const sidebarVariants: Variants = {
    expanded: { 
      width: 180, 
      transition: { 
        type: "spring", 
        stiffness: 600, 
        damping: 35,
        mass: 0.5
      } 
    },
    collapsed: { 
      width: 80, 
      transition: { 
        type: "spring", 
        stiffness: 600, 
        damping: 35,
        mass: 0.5
      } 
    }
  }

  // Animation variants for the text labels
  const labelVariants: Variants = {
    expanded: { 
      opacity: 1, 
      x: 0, 
      display: "block",
      transition: { duration: 0.15 } 
    },
    collapsed: { 
      opacity: 0, 
      x: -5, 
      transitionEnd: { display: "none" },
      transition: { duration: 0.1 } 
    }
  }

  return (
    <motion.div 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={isCollapsed ? "collapsed" : "expanded"}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      className={cn(
        "min-h-full bg-blue-600 text-blue-100 flex flex-col border-r border-blue-700 shadow-xl relative overflow-hidden",
        className
      )}
    >
      <nav className={cn("flex-1 space-y-3 pt-6 md:pt-10", isCollapsed ? "px-3" : "px-4")}>
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={idx}
              href={item.href}
              className={cn(
                "flex items-center rounded-xl transition-colors duration-200 group relative",
                isCollapsed ? "justify-center h-10 w-10 mx-auto" : "px-4 py-3 gap-3",
                isActive 
                  ? "bg-white text-blue-600 shadow-lg shadow-blue-700/20" 
                  : "hover:bg-blue-500 text-blue-100"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-200 group-hover:scale-110 shrink-0",
                isActive ? "text-blue-600" : "text-blue-200 group-hover:text-white"
              )} />
              
              <motion.span 
                variants={labelVariants}
                className="font-semibold whitespace-nowrap overflow-hidden"
              >
                {item.name}
              </motion.span>
              
              {isCollapsed && (
                 <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 font-bold uppercase tracking-wider translate-x-1 group-hover:translate-x-0 shadow-xl border border-slate-800">
                    {item.name}
                 </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Sidebar Footer with User Profile */}
      <div className={cn(
        "p-4 mt-auto border-t border-blue-500/30 w-full flex flex-col transition-all duration-300",
        isCollapsed ? "items-center" : "items-stretch"
      )}>
        <UserButton isCollapsed={isCollapsed} />
      </div>
    </motion.div>
  )
}
