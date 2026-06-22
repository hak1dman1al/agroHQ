export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { presentations, slides } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"
import { notFound } from "next/navigation"
import { PresentationEditor } from "@/components/presentations/presentation-editor"

async function getPresentation(id: string) {
  try {
    const pres = await db
      .select()
      .from(presentations)
      .where(eq(presentations.id, id))
      .limit(1)

    if (pres.length === 0) return null

    const slideList = await db
      .select()
      .from(slides)
      .where(eq(slides.presentationId, id))
      .orderBy(asc(slides.orderIndex))

    return { ...pres[0], slides: slideList }
  } catch {
    return null
  }
}

export default async function PresentationEditPage({ params }: { params: { id: string } }) {
  const pres = await getPresentation(params.id)
  if (!pres) notFound()

  return <PresentationEditor presentation={pres} />
}
