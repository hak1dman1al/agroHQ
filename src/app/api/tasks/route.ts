import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { tasks, activities } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, assigneeId, priority, dueDate } = body

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const [task] = await db
      .insert(tasks)
      .values({
        title,
        description,
        assigneeId,
        priority,
        status: "todo",
        dueDate: dueDate ? new Date(dueDate) : null,
        createdBy: user.id,
      })
      .returning()

    // Create activity
    await db.insert(activities).values({
      userId: user.id,
      entityType: "task",
      entityId: task.id,
      action: "task_created",
      details: `created task "${title}"`,
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Failed to create task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
