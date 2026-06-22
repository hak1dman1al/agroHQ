import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { documents, activities } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, filename, mimeType, size, minioKey, folderId, tags } = body

    if (!title || !filename || !mimeType || !size || !minioKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const [doc] = await db
      .insert(documents)
      .values({
        title,
        filename,
        mimeType,
        size,
        minioKey,
        folderId: folderId || null,
        tags,
        uploadedBy: user.id,
      })
      .returning()

    await db.insert(activities).values({
      userId: user.id,
      entityType: "document",
      entityId: doc.id,
      action: "document_uploaded",
      details: `uploaded "${title}"`,
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error("Failed to upload document:", error)
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    )
  }
}
