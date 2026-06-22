import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { taskComments, activities } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"

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
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    const [comment] = await db
      .insert(taskComments)
      .values({
        taskId: params.id,
        userId: user.id,
        content,
      })
      .returning()

    // Create activity
    await db.insert(activities).values({
      userId: user.id,
      entityType: "task",
      entityId: params.id,
      action: "task_commented",
      details: `commented on task`,
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Failed to add comment:", error)
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    )
  }
}
