import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { roadmaps } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"
import { eq } from "drizzle-orm"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const updates: any = { updatedAt: new Date() }

    if (body.status) updates.status = body.status
    if (body.title) updates.title = body.title
    if (body.description !== undefined) updates.description = body.description
    if (body.completionPercentage !== undefined) updates.completionPercentage = body.completionPercentage

    const [roadmap] = await db
      .update(roadmaps)
      .set(updates)
      .where(eq(roadmaps.id, params.id))
      .returning()

    return NextResponse.json(roadmap)
  } catch (error) {
    console.error("Failed to update roadmap:", error)
    return NextResponse.json({ error: "Failed to update roadmap" }, { status: 500 })
  }
}
