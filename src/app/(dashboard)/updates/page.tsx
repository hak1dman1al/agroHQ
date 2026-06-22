export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { progressUpdates, users, progressAttachments, progressReactions } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { UpdatesPage } from "@/components/updates/updates-page"

async function getUpdates() {
  try {
    const updates = await db
      .select({
        id: progressUpdates.id,
        content: progressUpdates.content,
        userId: progressUpdates.userId,
        userName: users.name,
        createdAt: progressUpdates.createdAt,
      })
      .from(progressUpdates)
      .innerJoin(users, eq(progressUpdates.userId, users.id))
      .orderBy(desc(progressUpdates.createdAt))
      .limit(50)

    // Get attachments and reactions for each update
    const updatesWithDetails = await Promise.all(
      updates.map(async (update) => {
        const attachments = await db
          .select()
          .from(progressAttachments)
          .where(eq(progressAttachments.updateId, update.id))

        const reactions = await db
          .select({
            id: progressReactions.id,
            emoji: progressReactions.emoji,
            userId: progressReactions.userId,
            userName: users.name,
          })
          .from(progressReactions)
          .innerJoin(users, eq(progressReactions.userId, users.id))
          .where(eq(progressReactions.updateId, update.id))

        return { ...update, attachments, reactions }
      })
    )

    return updatesWithDetails
  } catch {
    return []
  }
}

export default async function UpdatesRoute() {
  const updates = await getUpdates()
  return <UpdatesPage updates={updates} />
}
