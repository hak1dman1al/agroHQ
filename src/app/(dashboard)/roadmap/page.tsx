export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { roadmaps, milestones } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"
import { RoadmapPage } from "@/components/roadmap/roadmap-page"

async function getRoadmaps() {
  try {
    const roadmapList = await db
      .select()
      .from(roadmaps)
      .orderBy(asc(roadmaps.orderIndex))

    const roadmapsWithMilestones = await Promise.all(
      roadmapList.map(async (roadmap) => {
        const milestoneList = await db
          .select()
          .from(milestones)
          .where(eq(milestones.roadmapId, roadmap.id))
          .orderBy(asc(milestones.orderIndex))

        return { ...roadmap, milestones: milestoneList }
      })
    )

    return roadmapsWithMilestones
  } catch {
    return []
  }
}

export default async function RoadmapRoute() {
  const roadmapList = await getRoadmaps()
  return <RoadmapPage roadmaps={roadmapList} />
}
