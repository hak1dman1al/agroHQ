export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { visionSections } from "@/lib/db/schema"
import { asc } from "drizzle-orm"
import { VisionPage } from "@/components/vision/vision-page"

async function getSections() {
  try {
    return await db
      .select()
      .from(visionSections)
      .orderBy(asc(visionSections.orderIndex))
  } catch {
    return []
  }
}

export default async function VisionMissionPage() {
  const sections = await getSections()
  return <VisionPage sections={sections} />
}
