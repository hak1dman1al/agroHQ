export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { presentations, users, slides } from "@/lib/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import { PresentationsPage } from "@/components/presentations/presentations-page"

async function getPresentations() {
  try {
    const presList = await db
      .select({
        id: presentations.id,
        title: presentations.title,
        theme: presentations.theme,
        isPublic: presentations.isPublic,
        shareToken: presentations.shareToken,
        createdBy: presentations.createdBy,
        creatorName: users.name,
        createdAt: presentations.createdAt,
        updatedAt: presentations.updatedAt,
      })
      .from(presentations)
      .innerJoin(users, eq(presentations.createdBy, users.id))
      .orderBy(desc(presentations.updatedAt))

    const presWithSlideCount = await Promise.all(
      presList.map(async (pres) => {
        const [count] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(slides)
          .where(eq(slides.presentationId, pres.id))

        return { ...pres, slideCount: count?.count || 0 }
      })
    )

    return presWithSlideCount
  } catch {
    return []
  }
}

export default async function PresentationsRoute() {
  const presList = await getPresentations()
  return <PresentationsPage presentations={presList} />
}
