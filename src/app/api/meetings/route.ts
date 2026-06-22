import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { meetings, activities } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, date, agenda } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: "Title and date are required" },
        { status: 400 }
      )
    }

    const [meeting] = await db
      .insert(meetings)
      .values({
        title,
        date: new Date(date),
        agenda,
        createdBy: user.id,
      })
      .returning()

    await db.insert(activities).values({
      userId: user.id,
      entityType: "meeting",
      entityId: meeting.id,
      action: "meeting_created",
      details: `created meeting "${title}"`,
    })

    return NextResponse.json(meeting)
  } catch (error) {
    console.error("Failed to create meeting:", error)
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 })
  }
}
