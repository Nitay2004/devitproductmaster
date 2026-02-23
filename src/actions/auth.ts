"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// In a real app, use bcrypt to hash passwords. 
// For this demo, we'll use a simple simulation since no crypto lib is in package.json yet.
const hashPassword = (password: string) => `hashed_${password}`

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  // signup attempt

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { success: false, error: "User already exists" }
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword(password),
        name
      }
    })


    // Set session cookie (httpOnly, secure in production, 7 days expiry)
    const cookieStore = await cookies()
    cookieStore.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/"
    })

    return { success: true }
  } catch (error) {
    console.error("Signup error:", error)
    return { success: false, error: "Failed to create account" }
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // signin attempt

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return { success: false, error: "User not found. Please sign up first." }
    }

    if (user.password !== hashPassword(password)) {
      return { success: false, error: "Wrong password." }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/"
    })

    return { success: true }
  } catch (error) {
    console.error("Signin error:", error)
    return { success: false, error: "Failed to sign in" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  revalidatePath("/")
  redirect("/login")
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (!sessionId) return null

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    return user
  } catch (error) {
    console.error("GetCurrentUser error:", error)
    return null
  }
}
