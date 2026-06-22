export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { meetings, users, meetingActions, partners } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { MeetingDetail } from "@/components/meetings/meeting-detail"

async function getMeeting(id: string) {
  try {
    const meeting = await db
      .select({
        id: meetings.id,
        title: meetings.title,
        date: meetings.date,
        agenda: meetings.agenda,
        discussion: meetings.discussion,
        decisions: meetings.decisions,
        createdBy: meetings.createdBy,
        creatorName: users.name,
        createdAt: meetings.createdAt,
      })
      .from(meetings)
      .innerJoin(users, eq(meetings.createdBy, users.id))
      .where(eq(meetings.id, id))
      .limit(1)

    if (meeting.length === 0) return null

    const actions = await db
      .select({
        id: meetingActions.id,
        title: meetingActions.title,
        status: meetingActions.status,
        dueDate: meetingActions.dueDate,
        assigneeId: meetingActions.assigneeId,
        assigneeName: partners.name,
      })
      .from(meetingActions)
      .leftJoin(partners, eq(meetingActions.assigneeId, partners.id))
      .where(eq(meetingActions.meetingId, id))

    return { ...meeting[0], actions }
  } catch {
    return null
  }
}

async function getPartners() {
  try {
    return await db.select({ id: partners.id, name: partners.name }).from(partners)
  } catch {
    return []
  }
}

export default async function MeetingDetailPage({ params }: { params: { id: string } }) {
  const meeting = await getMeeting(params.id)
  if (!meeting) notFound()

  const partnerList = await getPartners()
  return <MeetingDetail meeting={meeting} partners={partnerList} />
}
