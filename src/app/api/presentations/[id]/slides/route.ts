import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { slides } from "@/lib/db/schema"
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
    const { type, layout, title, subtitle, mainMessage, contentJson, orderIndex } = body

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 })
    }

    const [slide] = await db
      .insert(slides)
      .values({
        presentationId: params.id,
        type,
        layout: layout || "center",
        title: title || null,
        subtitle: subtitle || null,
        mainMessage: mainMessage || null,
        contentJson: contentJson || {},
        orderIndex: orderIndex || 0,
      })
      .returning()

    return NextResponse.json(slide)
  } catch (error) {
    console.error("Failed to add slide:", error)
    return NextResponse.json(
      { error: "Failed to add slide" },
      { status: 500 }
    )
  }
}
