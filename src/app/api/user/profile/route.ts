import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { users } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"
import { eq } from "drizzle-orm"

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    await db
      .update(users)
      .set({ name, email, updatedAt: new Date() })
      .where(eq(users.id, user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
