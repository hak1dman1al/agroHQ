import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { progressUpdates, activities } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const [update] = await db
      .insert(progressUpdates)
      .values({
        userId: user.id,
        content,
      })
      .returning()

    await db.insert(activities).values({
      userId: user.id,
      entityType: "document",
      entityId: update.id,
      action: "update_posted",
      details: `posted an update: "${content.substring(0, 50)}..."`,
    })

    return NextResponse.json(update)
  } catch (error) {
    console.error("Failed to post update:", error)
    return NextResponse.json({ error: "Failed to post update" }, { status: 500 })
  }
}
