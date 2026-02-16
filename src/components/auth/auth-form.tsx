"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github } from "lucide-react"
import { signIn, signUp } from "@/actions/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleAction = async (formData: FormData, type: 'login' | 'signup') => {
    setIsLoading(true)
    const result = type === 'login' ? await signIn(formData) : await signUp(formData)
    setIsLoading(false)

    if (result.success) {
      toast.success(type === 'login' ? "Logged in successfully" : "Account created successfully")
      router.push("/")
      router.refresh()
    }
  }

  if (!mounted) {
    return <div className="h-[400px] w-full" /> // Placeholder to prevent layout shift
  }

  return (
    <div className="grid gap-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <TabsContent value="login" key="login">
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                action={(fd) => handleAction(fd, 'login')} 
                className="grid gap-4"
              >
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    placeholder="name@example.com" 
                    type="email" 
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    required 
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    name="password"
                    placeholder="Password"
                    type="password" 
                    autoComplete="current-password"
                    disabled={isLoading}
                    required 
                  />
                </div>
                <Button 
                  className="w-full bg-white text-black hover:bg-slate-200 border border-slate-200 shadow-sm font-medium h-10" 
                  disabled={isLoading}
                >
                  {isLoading ? "Please wait..." : "Sign In with Email"}
                </Button>
              </motion.form>
            </TabsContent>

            <TabsContent value="signup" key="signup">
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                action={(fd) => handleAction(fd, 'signup')} 
                className="grid gap-4"
              >
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="John Doe" 
                    autoComplete="name"
                    disabled={isLoading}
                    required 
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    name="email"
                    placeholder="name@example.com" 
                    type="email" 
                    autoComplete="email"
                    disabled={isLoading}
                    required 
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    name="password"
                    placeholder="Password"
                    type="password" 
                    autoComplete="new-password"
                    disabled={isLoading}
                    required 
                  />
                </div>
                <Button 
                  className="w-full bg-white text-black hover:bg-slate-200 border border-slate-200 shadow-sm font-medium h-10" 
                  disabled={isLoading}
                >
                  {isLoading ? "Please wait..." : "Create Account"}
                </Button>
              </motion.form>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <Button variant="outline" type="button" disabled={isLoading} className="w-full h-10">
          {isLoading ? (
            "Wait..."
          ) : (
            <Github className="mr-2 h-4 w-4" />
          )}{" "}
          GitHub
        </Button>
    </div>
  )
}
