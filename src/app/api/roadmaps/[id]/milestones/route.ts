import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { milestones, roadmaps } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"
import { eq } from "drizzle-orm"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Get current milestone count for ordering
    const existing = await db
      .select()
      .from(milestones)
      .where(eq(milestones.roadmapId, params.id))

    const [milestone] = await db
      .insert(milestones)
      .values({
        roadmapId: params.id,
        title,
        description,
        orderIndex: existing.length,
      })
      .returning()

    // Recalculate roadmap completion
    const allMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.roadmapId, params.id))

    const completed = allMilestones.filter((m) => m.isCompleted).length
    const total = allMilestones.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    await db
      .update(roadmaps)
      .set({ completionPercentage: percentage, updatedAt: new Date() })
      .where(eq(roadmaps.id, params.id))

    return NextResponse.json(milestone)
  } catch (error) {
    console.error("Failed to add milestone:", error)
    return NextResponse.json({ error: "Failed to add milestone" }, { status: 500 })
  }
}
