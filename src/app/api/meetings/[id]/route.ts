import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { meetings } from "@/lib/db/schema"
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
    const updates: any = { updatedAt: new Date() }

    if (body.title) updates.title = body.title
    if (body.agenda !== undefined) updates.agenda = body.agenda
    if (body.discussion !== undefined) updates.discussion = body.discussion
    if (body.decisions !== undefined) updates.decisions = body.decisions
    if (body.date) updates.date = new Date(body.date)

    const [meeting] = await db
      .update(meetings)
      .set(updates)
      .where(eq(meetings.id, params.id))
      .returning()

    return NextResponse.json(meeting)
  } catch (error) {
    console.error("Failed to update meeting:", error)
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 })
  }
}
