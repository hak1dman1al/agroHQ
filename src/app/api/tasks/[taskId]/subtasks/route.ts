import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { taskSubtasks } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth/session"

// GET /api/tasks/[taskId]/subtasks - Get all subtasks for a task
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subtasks = await db
      .select()
      .from(taskSubtasks)
      .where(eq(taskSubtasks.taskId, params.taskId))
      .orderBy(taskSubtasks.orderIndex, taskSubtasks.createdAt)

    return NextResponse.json(subtasks)
  } catch (error) {
    console.error("Error fetching subtasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch subtasks" },
      { status: 500 }
    )
  }
}

// POST /api/tasks/[taskId]/subtasks - Create a new subtask
export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title } = body

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    // Get the next order index
    const maxOrder = await db
      .select({ maxIndex: sql<number>`COALESCE(MAX(${taskSubtasks.orderIndex}), -1)` })
      .from(taskSubtasks)
      .where(eq(taskSubtasks.taskId, params.taskId))

    const nextOrder = (maxOrder[0]?.maxIndex ?? -1) + 1

    const [newSubtask] = await db
      .insert(taskSubtasks)
      .values({
        taskId: params.taskId,
        title: title.trim(),
        orderIndex: nextOrder,
        isCompleted: false,
      })
      .returning()

    return NextResponse.json(newSubtask)
  } catch (error) {
    console.error("Error creating subtask:", error)
    return NextResponse.json(
      { error: "Failed to create subtask" },
      { status: 500 }
    )
  }
}
