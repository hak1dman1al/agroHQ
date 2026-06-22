import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { verifications } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, role } = body

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      )
    }

    const token = crypto.randomUUID()

    await db.insert(verifications).values({
      id: crypto.randomUUID(),
      identifier: token,
      value: JSON.stringify({ name, email, role }),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const inviteLink = `${baseUrl}/invite/${token}`

    return NextResponse.json({ inviteLink })
  } catch (error) {
    console.error("Failed to create invite:", error)
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    )
  }
}
