import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { milestones, roadmaps } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"
import { eq } from "drizzle-orm"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()

    const [milestone] = await db
      .update(milestones)
      .set({ isCompleted: body.isCompleted })
      .where(eq(milestones.id, params.id))
      .returning()

    // Recalculate roadmap completion
    const allMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.roadmapId, milestone.roadmapId))

    const completed = allMilestones.filter((m) => m.isCompleted).length
    const total = allMilestones.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    await db
      .update(roadmaps)
      .set({ completionPercentage: percentage, updatedAt: new Date() })
      .where(eq(roadmaps.id, milestone.roadmapId))

    return NextResponse.json(milestone)
  } catch (error) {
    console.error("Failed to update milestone:", error)
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 })
  }
}
