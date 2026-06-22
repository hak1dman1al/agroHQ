import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { tasks, activities } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"
import { eq } from "drizzle-orm"

// Quick status update - lightweight endpoint for inline edits
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
    const { status, priority } = body

    if (!status && !priority) {
      return NextResponse.json(
        { error: "Status or priority is required" },
        { status: 400 }
      )
    }

    const updates: any = { updatedAt: new Date() }
    if (status) updates.status = status
    if (priority) updates.priority = priority

    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, params.id))
      .returning()

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Log activity
    const changes: string[] = []
    if (status) changes.push(`status → ${status}`)
    if (priority) changes.push(`priority → ${priority}`)

    await db.insert(activities).values({
      userId: user.id,
      entityType: "task",
      entityId: params.id,
      action: "task_quick_update",
      details: `updated ${changes.join(", ")}`,
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Quick update failed:", error)
    return NextResponse.json(
      { error: "Update failed" },
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

    const [task] = await db
      .delete(tasks)
      .where(eq(tasks.id, params.id))
      .returning()

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Log activity
    await db.insert(activities).values({
      userId: user.id,
      entityType: "task",
      entityId: params.id,
      action: "task_deleted",
      details: `deleted task "${task.title}"`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete failed:", error)
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}
