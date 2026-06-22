import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { documents } from "@/lib/db/schema"
import { getSignedDownloadUrl } from "@/lib/storage/minio"
import { getCurrentUser } from "@/lib/auth/session"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const doc = await db
      .select()
      .from(documents)
      .where(eq(documents.id, params.id))
      .limit(1)

    if (doc.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const url = await getSignedDownloadUrl(doc[0].minioKey)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Failed to get download URL:", error)
    return NextResponse.json(
      { error: "Failed to get download URL" },
      { status: 500 }
    )
  }
}
