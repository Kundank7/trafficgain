import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(payload: any): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(JWT_SECRET))

  return token
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch (error) {
    return null
  }
}

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  const payload = await verifyToken(token)
  return payload
}

export async function getUserFromSession() {
  const session = await getSession()

  if (!session || !session.id) return null

  const user = await prisma.user.findUnique({
    where: { id: Number(session.id) },
    select: {
      id: true,
      email: true,
      role: true,
      balance: true,
    },
  })

  return user
}

export async function requireAuth(request: NextRequest) {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const payload = await verifyToken(token)

  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return null
}

export async function requireAdmin(request: NextRequest) {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const payload = await verifyToken(token)

  if (!payload || payload.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return null
}
