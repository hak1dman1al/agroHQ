import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { meetings, meetingParticipants, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth/session"

// GET /api/meetings/[id]/ics - Export meeting as ICS calendar file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch meeting
    const [meeting] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, params.id))
      .limit(1)

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    // Fetch participants
    const participants = await db
      .select({
        userId: meetingParticipants.userId,
        email: users.email,
        name: users.name,
      })
      .from(meetingParticipants)
      .leftJoin(users, eq(meetingParticipants.userId, users.id))
      .where(eq(meetingParticipants.meetingId, params.id))

    // Format date for ICS (YYYYMMDDTHHMMSSZ)
    const meetingDate = new Date(meeting.date)
    const endDate = new Date(meetingDate.getTime() + 60 * 60 * 1000) // 1 hour default
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    // Build attendee list
    const attendees = participants
      .filter((p) => p.email)
      .map((p) => `ATTENDEE;CN="${p.name}":mailto:${p.email}`)
      .join("\r\n")

    // Build ICS content
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Agro HQ//Meeting Export//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `DTSTART:${formatDate(meetingDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `DTSTAMP:${formatDate(new Date())}`,
      `UID:${meeting.id}@agrohq`,
      `SUMMARY:${meeting.title}`,
      meeting.location ? `LOCATION:${meeting.location}` : "",
      meeting.agenda ? `DESCRIPTION:${meeting.agenda.replace(/\n/g, "\\n")}` : "",
      attendees,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter((line) => line !== "")
      .join("\r\n")

    // Return ICS file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${meeting.title}.ics"`,
      },
    })
  } catch (error) {
    console.error("Error exporting ICS:", error)
    return NextResponse.json(
      { error: "Failed to export calendar" },
      { status: 500 }
    )
  }
}
