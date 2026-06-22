import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { progressReactions } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"
import { eq, and } from "drizzle-orm"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { emoji } = body

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 })
    }

    // Check if user already reacted with this emoji
    const existing = await db
      .select()
      .from(progressReactions)
      .where(
        and(
          eq(progressReactions.updateId, params.id),
          eq(progressReactions.userId, user.id),
          eq(progressReactions.emoji, emoji)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      // Remove reaction (toggle)
      await db
        .delete(progressReactions)
        .where(eq(progressReactions.id, existing[0].id))

      return NextResponse.json({ removed: true })
    }

    // Add reaction
    const [reaction] = await db
      .insert(progressReactions)
      .values({
        updateId: params.id,
        userId: user.id,
        emoji,
      })
      .returning()

    return NextResponse.json(reaction)
  } catch (error) {
    console.error("Failed to add reaction:", error)
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 })
  }
}
