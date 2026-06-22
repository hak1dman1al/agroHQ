import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { documentFolders } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, parentId } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const [folder] = await db
      .insert(documentFolders)
      .values({
        name,
        parentId: parentId || null,
        createdBy: user.id,
      })
      .returning()

    return NextResponse.json(folder)
  } catch (error) {
    console.error("Failed to create folder:", error)
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    )
  }
}
