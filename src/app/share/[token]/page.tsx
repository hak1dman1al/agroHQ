import { db } from "@/lib/db/client"
import { presentations, slides } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"
import { notFound } from "next/navigation"
import { PublicPresentationViewer } from "@/components/presentations/public-presentation-viewer"

async function getPresentationByToken(token: string) {
  try {
    const [presentation] = await db
      .select()
      .from(presentations)
      .where(eq(presentations.shareToken, token))
      .limit(1)

    if (!presentation || !presentation.isPublic) {
      return null
    }

    const presentationSlides = await db
      .select()
      .from(slides)
      .where(eq(slides.presentationId, presentation.id))
      .orderBy(asc(slides.orderIndex))

    return { ...presentation, slides: presentationSlides }
  } catch {
    return null
  }
}

export default async function SharePage({
  params,
}: {
  params: { token: string }
}) {
  const presentation = await getPresentationByToken(params.token)

  if (!presentation) {
    notFound()
  }

  return <PublicPresentationViewer presentation={presentation} />
}
