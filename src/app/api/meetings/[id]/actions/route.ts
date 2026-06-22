import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { meetingActions } from "@/lib/db/schema"
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
    const { title, assigneeId, dueDate } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const [action] = await db
      .insert(meetingActions)
      .values({
        meetingId: params.id,
        title,
        assigneeId: assigneeId || null,
        status: "todo",
        dueDate: dueDate ? new Date(dueDate) : null,
      })
      .returning()

    return NextResponse.json(action)
  } catch (error) {
    console.error("Failed to add action:", error)
    return NextResponse.json({ error: "Failed to add action" }, { status: 500 })
  }
}
