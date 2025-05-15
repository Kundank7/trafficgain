import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserFromSession } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromSession()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()
    const depositId = Number.parseInt(params.id)

    if (!status || !depositId) {
      return NextResponse.json({ error: "Status and deposit ID are required" }, { status: 400 })
    }

    // Start a transaction to update deposit status and user balance if approved
    const result = await prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.findUnique({
        where: { id: depositId },
        include: { user: true },
      })

      if (!deposit) {
        throw new Error("Deposit not found")
      }

      // Update deposit status
      const updatedDeposit = await tx.deposit.update({
        where: { id: depositId },
        data: { status },
      })

      // If deposit is approved, add amount to user's balance
      if (status === "verified") {
        await tx.user.update({
          where: { id: deposit.userId },
          data: {
            balance: {
              increment: deposit.amount,
            },
          },
        })
      }

      return updatedDeposit
    })

    return NextResponse.json({ deposit: result })
  } catch (error) {
    console.error("Update deposit error:", error)
    return NextResponse.json({ error: "Failed to update deposit" }, { status: 500 })
  }
}
