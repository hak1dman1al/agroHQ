import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { tasks, activities } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"
import { eq } from "drizzle-orm"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const updates: any = {}

    if (body.status) updates.status = body.status
    if (body.priority) updates.priority = body.priority
    if (body.assigneeId !== undefined) updates.assigneeId = body.assigneeId
    if (body.title) updates.title = body.title
    if (body.description !== undefined) updates.description = body.description
    if (body.dueDate !== undefined) {
      updates.dueDate = body.dueDate ? new Date(body.dueDate) : null
    }

    updates.updatedAt = new Date()

    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, params.id))
      .returning()

    // Create activity
    const changes = Object.keys(updates)
      .filter((k) => k !== "updatedAt")
      .join(", ")

    await db.insert(activities).values({
      userId: user.id,
      entityType: "task",
      entityId: params.id,
      action: "task_updated",
      details: `updated ${changes}`,
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Failed to update task:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.delete(tasks).where(eq(tasks.id, params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete task:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
