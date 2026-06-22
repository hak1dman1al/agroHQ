import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { meetingAttachments } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth/session"
import { getSignedUploadUrl } from "@/lib/storage/minio"

// GET /api/meetings/[id]/attachments - Get all attachments for a meeting
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attachments = await db
      .select()
      .from(meetingAttachments)
      .where(eq(meetingAttachments.meetingId, params.id))
      .orderBy(meetingAttachments.createdAt)

    return NextResponse.json(attachments)
  } catch (error) {
    console.error("Error fetching meeting attachments:", error)
    return NextResponse.json(
      { error: "Failed to fetch attachments" },
      { status: 500 }
    )
  }
}

// POST /api/meetings/[id]/attachments - Create attachment record
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
      .insert(meetingAttachments)
      .values({
        meetingId: params.id,
        filename,
        mimeType,
        size,
        minioKey,
        uploadedBy: user.id,
      })
      .returning()

    return NextResponse.json(attachment)
  } catch (error) {
    console.error("Error creating meeting attachment:", error)
    return NextResponse.json(
      { error: "Failed to create attachment" },
      { status: 500 }
    )
  }
}
