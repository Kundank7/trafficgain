import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserFromSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const amount = Number.parseFloat(formData.get("amount") as string)
    const method = formData.get("method") as string
    const screenshot = formData.get("screenshot") as File

    if (!amount || !method || !screenshot) {
      return NextResponse.json({ error: "Amount, method, and screenshot are required" }, { status: 400 })
    }

    // In a real app, you would upload the screenshot to a storage service
    // For this example, we'll just store the file name
    const screenshotName = `${Date.now()}-${screenshot.name}`

    const deposit = await prisma.deposit.create({
      data: {
        amount,
        method,
        screenshot: screenshotName,
        status: "pending",
        userId: user.id,
      },
    })

    return NextResponse.json({ deposit }, { status: 201 })
  } catch (error) {
    console.error("Deposit creation error:", error)
    return NextResponse.json({ error: "Failed to create deposit" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // If admin, get all deposits, otherwise get only user's deposits
    const deposits =
      user.role === "admin"
        ? await prisma.deposit.findMany({
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          })
        : await prisma.deposit.findMany({
            where: {
              userId: user.id,
            },
            orderBy: {
              createdAt: "desc",
            },
          })

    return NextResponse.json({ deposits })
  } catch (error) {
    console.error("Get deposits error:", error)
    return NextResponse.json({ error: "Failed to get deposits" }, { status: 500 })
  }
}
