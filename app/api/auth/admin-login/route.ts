import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Check hardcoded admin credentials
    const adminUsername = process.env.ADMIN_USERNAME || "admin"
    const adminPassword = process.env.ADMIN_PASSWORD || "Arya123@"

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 })
    }

    // Create JWT token with admin role
    const token = await createToken({
      id: 0, // Special ID for hardcoded admin
      email: "admin@system.com",
      role: "admin",
    })

    // Set cookie
    cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return NextResponse.json({
      user: {
        id: 0,
        email: "admin@system.com",
        role: "admin",
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Failed to login as admin" }, { status: 500 })
  }
}
