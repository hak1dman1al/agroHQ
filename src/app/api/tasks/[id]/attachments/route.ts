import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { taskAttachments, activities } from "@/lib/db/schema"
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
    const { filename, mimeType, size, minioKey } = body

    if (!filename || !mimeType || !size || !minioKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const [attachment] = await db
      .insert(taskAttachments)
      .values({
        taskId: params.id,
        filename,
        mimeType,
        size,
        minioKey,
        uploadedBy: user.id,
      })
      .returning()

    // Create activity
    await db.insert(activities).values({
      userId: user.id,
      entityType: "task",
      entityId: params.id,
      action: "task_attached",
      details: `uploaded "${filename}"`,
    })

    return NextResponse.json(attachment)
  } catch (error) {
    console.error("Failed to save attachment:", error)
    return NextResponse.json(
      { error: "Failed to save attachment" },
      { status: 500 }
    )
  }
}
