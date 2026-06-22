import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { roadmaps, activities } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, startDate, endDate, status } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const [roadmap] = await db
      .insert(roadmaps)
      .values({
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || "planned",
        createdBy: user.id,
      })
      .returning()

    await db.insert(activities).values({
      userId: user.id,
      entityType: "document",
      entityId: roadmap.id,
      action: "roadmap_created",
      details: `created roadmap phase "${title}"`,
    })

    return NextResponse.json(roadmap)
  } catch (error) {
    console.error("Failed to create roadmap:", error)
    return NextResponse.json({ error: "Failed to create roadmap" }, { status: 500 })
  }
}
