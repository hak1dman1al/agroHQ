import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { capitalContributions, activities } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { partnerId, amount, date, notes } = body

    if (!partnerId || !amount || !date) {
      return NextResponse.json(
        { error: "Partner, amount, and date are required" },
        { status: 400 }
      )
    }

    const [contribution] = await db
      .insert(capitalContributions)
      .values({
        partnerId,
        amount,
        date: new Date(date),
        notes,
        createdBy: user.id,
      })
      .returning()

    await db.insert(activities).values({
      userId: user.id,
      entityType: "document",
      entityId: contribution.id,
      action: "contribution_added",
      details: `added capital contribution of ${amount / 100}`,
    })

    return NextResponse.json(contribution)
  } catch (error) {
    console.error("Failed to add contribution:", error)
    return NextResponse.json(
      { error: "Failed to add contribution" },
      { status: 500 }
    )
  }
}
