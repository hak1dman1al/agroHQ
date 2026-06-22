import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { presentations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth/session"
import { randomBytes } from "crypto"

// GET /api/presentations/[id]/share - Get share status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [presentation] = await db
      .select()
      .from(presentations)
      .where(eq(presentations.id, params.id))
      .limit(1)

    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const shareUrl = presentation.shareToken
      ? `${baseUrl}/share/${presentation.shareToken}`
      : null

    return NextResponse.json({
      isPublic: presentation.isPublic,
      shareToken: presentation.shareToken,
      shareUrl,
    })
  } catch (error) {
    console.error("Error getting share status:", error)
    return NextResponse.json(
      { error: "Failed to get share status" },
      { status: 500 }
    )
  }
}

// POST /api/presentations/[id]/share - Toggle public sharing
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [presentation] = await db
      .select()
      .from(presentations)
      .where(eq(presentations.id, params.id))
      .limit(1)

    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 })
    }

    // Toggle public status
    const newIsPublic = !presentation.isPublic
    
    // Generate share token if enabling public sharing and no token exists
    let shareToken = presentation.shareToken
    if (newIsPublic && !shareToken) {
      shareToken = randomBytes(16).toString("hex")
    }

    const [updated] = await db
      .update(presentations)
      .set({
        isPublic: newIsPublic,
        shareToken,
      })
      .where(eq(presentations.id, params.id))
      .returning()

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const shareUrl = newIsPublic && shareToken
      ? `${baseUrl}/share/${shareToken}`
      : null

    return NextResponse.json({
      isPublic: newIsPublic,
      shareToken,
      shareUrl,
    })
  } catch (error) {
    console.error("Error toggling share:", error)
    return NextResponse.json(
      { error: "Failed to toggle sharing" },
      { status: 500 }
    )
  }
}
