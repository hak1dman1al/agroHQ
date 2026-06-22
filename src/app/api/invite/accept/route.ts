import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { verifications, partners, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, userId } = body

    if (!token || !userId) {
      return NextResponse.json(
        { error: "Token and user ID are required" },
        { status: 400 }
      )
    }

    // Find the verification record
    const verification = await db
      .select()
      .from(verifications)
      .where(eq(verifications.identifier, token))
      .limit(1)

    if (verification.length === 0) {
      return NextResponse.json(
        { error: "Invalid invite" },
        { status: 404 }
      )
    }

    const record = verification[0]
    const data = JSON.parse(record.value)

    // Update user role to partner
    await db
      .update(users)
      .set({ role: "partner" })
      .where(eq(users.id, userId))

    // Create partner profile
    await db.insert(partners).values({
      userId,
      name: data.name,
      email: data.email,
      role: data.role || "Partner",
    })

    // Delete the verification record
    await db
      .delete(verifications)
      .where(eq(verifications.identifier, token))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Invite acceptance failed:", error)
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 }
    )
  }
}
