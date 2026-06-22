import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { verifications } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  try {
    const verification = await db
      .select()
      .from(verifications)
      .where(eq(verifications.identifier, token))
      .limit(1)

    if (verification.length === 0) {
      return NextResponse.json({ valid: false })
    }

    const record = verification[0]

    // Check if expired
    if (new Date(record.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false })
    }

    // Parse the value which contains name and email
    const data = JSON.parse(record.value)

    return NextResponse.json({
      valid: true,
      name: data.name,
      email: data.email,
    })
  } catch (error) {
    console.error("Invite verification failed:", error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
