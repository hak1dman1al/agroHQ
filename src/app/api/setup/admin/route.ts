import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, userId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to set admin role:", error)
    return NextResponse.json(
      { error: "Failed to set admin role" },
      { status: 500 }
    )
  }
}
