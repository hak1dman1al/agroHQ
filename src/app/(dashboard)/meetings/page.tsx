export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { meetings, users, meetingParticipants, meetingActions, partners } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { MeetingsPage } from "@/components/meetings/meetings-page"

async function getMeetings() {
  try {
    const meetingList = await db
      .select({
        id: meetings.id,
        title: meetings.title,
        date: meetings.date,
        agenda: meetings.agenda,
        decisions: meetings.decisions,
        createdBy: meetings.createdBy,
        creatorName: users.name,
        createdAt: meetings.createdAt,
      })
      .from(meetings)
      .innerJoin(users, eq(meetings.createdBy, users.id))
      .orderBy(desc(meetings.date))

    // Get action items count for each meeting
    const meetingsWithActions = await Promise.all(
      meetingList.map(async (meeting) => {
        const actions = await db
          .select({
            id: meetingActions.id,
            title: meetingActions.title,
            status: meetingActions.status,
          })
          .from(meetingActions)
          .where(eq(meetingActions.meetingId, meeting.id))

        return {
          ...meeting,
          actionCount: actions.length,
          completedActions: actions.filter((a) => a.status === "completed").length,
        }
      })
    )

    return meetingsWithActions
  } catch {
    return []
  }
}

export default async function MeetingsRoute() {
  const meetingList = await getMeetings()
  return <MeetingsPage meetings={meetingList} />
}
