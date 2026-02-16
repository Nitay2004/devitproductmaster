"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  LogOut, 
  User as UserIcon, 
  CreditCard, 
  Bell, 
  Sparkles,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logout, getCurrentUser } from "@/actions/auth"
import { cn } from "@/lib/utils"

interface UserButtonProps {
  isCollapsed?: boolean
  showLabel?: boolean
}

export function UserButton({ isCollapsed = false, showLabel = true }: UserButtonProps) {
  const [user, setUser] = React.useState<{ name: string | null; email: string } | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser()
      if (userData) {
        setUser({ name: userData.name, email: userData.email })
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const initials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email ? user.email[0].toUpperCase() : "U"

  const triggerContent = (
    <div className={cn(
      "flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
      isCollapsed ? "justify-center w-10 h-10" : "w-full"
    )}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={`https://avatar.vercel.sh/${user?.email || "user"}.png`} alt={user?.name || "User"} />
        <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">{initials}</AvatarFallback>
      </Avatar>
      
      {!isCollapsed && showLabel && (
        <div className="flex flex-1 flex-col items-start text-left text-sm">
          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate w-24">
            {user?.name || "User"}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate w-24">
            {user?.email || "m@example.com"}
          </span>
        </div>
      )}
      
      {!isCollapsed && showLabel && (
        <div className="flex flex-col text-slate-400">
          <ChevronUp className="h-3 w-3" />
          <ChevronDown className="h-3 w-3 -mt-1" />
        </div>
      )}
    </div>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none w-full">
          {triggerContent}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align={isCollapsed ? "start" : "end"} side={isCollapsed ? "right" : "bottom"} sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 p-1">
            <div className="flex items-center gap-2">
               <Avatar className="h-8 w-8">
                <AvatarImage src={`https://avatar.vercel.sh/${user?.email || "user"}.png`} alt={user?.name || "User"} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "m@example.com"}
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
