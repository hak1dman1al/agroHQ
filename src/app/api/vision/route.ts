import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { visionSections } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, type } = body

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: "Title, content, and type are required" },
        { status: 400 }
      )
    }

    const [section] = await db
      .insert(visionSections)
      .values({
        title,
        content,
        type,
        createdBy: user.id,
      })
      .returning()

    return NextResponse.json(section)
  } catch (error) {
    console.error("Failed to create vision section:", error)
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    )
  }
}
