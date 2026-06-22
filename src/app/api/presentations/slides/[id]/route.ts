import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { slides } from "@/lib/db/schema"
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

    if (body.type) updates.type = body.type
    if (body.layout) updates.layout = body.layout
    if (body.title !== undefined) updates.title = body.title
    if (body.subtitle !== undefined) updates.subtitle = body.subtitle
    if (body.mainMessage !== undefined) updates.mainMessage = body.mainMessage
    if (body.contentJson !== undefined) updates.contentJson = body.contentJson
    if (body.orderIndex !== undefined) updates.orderIndex = body.orderIndex

    const [slide] = await db
      .update(slides)
      .set(updates)
      .where(eq(slides.id, params.id))
      .returning()

    return NextResponse.json(slide)
  } catch (error) {
    console.error("Failed to update slide:", error)
    return NextResponse.json(
      { error: "Failed to update slide" },
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

    await db.delete(slides).where(eq(slides.id, params.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete slide:", error)
    return NextResponse.json(
      { error: "Failed to delete slide" },
      { status: 500 }
    )
  }
}
