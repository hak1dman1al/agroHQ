import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { presentations, activities } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, theme } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const shareToken = crypto.randomBytes(16).toString("hex")

    const [presentation] = await db
      .insert(presentations)
      .values({
        title,
        theme: theme || "executive",
        shareToken,
        createdBy: user.id,
      })
      .returning()

    await db.insert(activities).values({
      userId: user.id,
      entityType: "document",
      entityId: presentation.id,
      action: "presentation_created",
      details: `created presentation "${title}"`,
    })

    return NextResponse.json(presentation)
  } catch (error) {
    console.error("Failed to create presentation:", error)
    return NextResponse.json(
      { error: "Failed to create presentation" },
      { status: 500 }
    )
  }
}
