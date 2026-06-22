import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { taskSubtasks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth/session"

// PATCH /api/tasks/subtasks/[id] - Update a subtask
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
    const { title, isCompleted, orderIndex } = body

    const updates: any = {}
    if (title !== undefined) updates.title = title.trim()
    if (isCompleted !== undefined) updates.isCompleted = isCompleted
    if (orderIndex !== undefined) updates.orderIndex = orderIndex

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const [updatedSubtask] = await db
      .update(taskSubtasks)
      .set(updates)
      .where(eq(taskSubtasks.id, params.id))
      .returning()

    if (!updatedSubtask) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 })
    }

    return NextResponse.json(updatedSubtask)
  } catch (error) {
    console.error("Error updating subtask:", error)
    return NextResponse.json(
      { error: "Failed to update subtask" },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/subtasks/[id] - Delete a subtask
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [deleted] = await db
      .delete(taskSubtasks)
      .where(eq(taskSubtasks.id, params.id))
      .returning()

    if (!deleted) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subtask:", error)
    return NextResponse.json(
      { error: "Failed to delete subtask" },
      { status: 500 }
    )
  }
}
