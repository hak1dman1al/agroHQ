import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { meetingActions } from "@/lib/db/schema"
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

    const [action] = await db
      .update(meetingActions)
      .set({ status: body.status })
      .where(eq(meetingActions.id, params.id))
      .returning()

    return NextResponse.json(action)
  } catch (error) {
    console.error("Failed to update action:", error)
    return NextResponse.json({ error: "Failed to update action" }, { status: 500 })
  }
}
