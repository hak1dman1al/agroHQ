import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { visionSections } from "@/lib/db/schema"
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

    if (body.title) updates.title = body.title
    if (body.content !== undefined) updates.content = body.content
    if (body.orderIndex !== undefined) updates.orderIndex = body.orderIndex

    const [section] = await db
      .update(visionSections)
      .set(updates)
      .where(eq(visionSections.id, params.id))
      .returning()

    return NextResponse.json(section)
  } catch (error) {
    console.error("Failed to update vision section:", error)
    return NextResponse.json(
      { error: "Failed to update section" },
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
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await db.delete(visionSections).where(eq(visionSections.id, params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete vision section:", error)
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    )
  }
}
