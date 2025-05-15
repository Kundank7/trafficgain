import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserFromSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quantity, country, device, cost } = await request.json()

    if (!quantity || !country || !device || !cost) {
      return NextResponse.json({ error: "All order details are required" }, { status: 400 })
    }

    // Check if user has enough balance
    if (user.balance < cost) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Start a transaction to create order and deduct balance
    const result = await prisma.$transaction(async (tx) => {
      // Deduct balance from user
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: cost,
          },
        },
      })

      // Create order
      const order = await tx.order.create({
        data: {
          quantity,
          country,
          device,
          cost,
          status: "pending",
          progress: 0,
          userId: user.id,
        },
      })

      return { user: updatedUser, order }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // If admin, get all orders, otherwise get only user's orders
    const orders =
      user.role === "admin"
        ? await prisma.order.findMany({
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
        : await prisma.order.findMany({
            where: {
              userId: user.id,
            },
            orderBy: {
              createdAt: "desc",
            },
          })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Failed to get orders" }, { status: 500 })
  }
}
