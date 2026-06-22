import { NextRequest, NextResponse } from "next/server"
import { getSignedUploadUrl } from "@/lib/storage/minio"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { filename, contentType } = body

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and content type are required" },
        { status: 400 }
      )
    }

    const { url, key } = await getSignedUploadUrl(filename, contentType)

    return NextResponse.json({ url, key })
  } catch (error) {
    console.error("Failed to generate upload URL:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
