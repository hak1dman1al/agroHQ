import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { financialTransactions, activities } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { type, category, amount, date, description } = body

    if (!type || !category || !amount || !date) {
      return NextResponse.json(
        { error: "Type, category, amount, and date are required" },
        { status: 400 }
      )
    }

    const [transaction] = await db
      .insert(financialTransactions)
      .values({
        type,
        category,
        amount,
        date: new Date(date),
        description,
        createdBy: user.id,
      })
      .returning()

    await db.insert(activities).values({
      userId: user.id,
      entityType: "document",
      entityId: transaction.id,
      action: "transaction_added",
      details: `added ${type} of ${amount / 100} for ${category}`,
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Failed to add transaction:", error)
    return NextResponse.json(
      { error: "Failed to add transaction" },
      { status: 500 }
    )
  }
}
