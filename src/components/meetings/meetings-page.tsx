"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import {
  Calendar,
  Plus,
  Loader2,
  Users,
  FileText,
  CheckCircle2,
  ListChecks,
} from "lucide-react"
import Link from "next/link"

interface Meeting {
  id: string
  title: string
  date: Date
  agenda: string | null
  decisions: string | null
  createdBy: string
  creatorName: string
  createdAt: Date
  actionCount: number
  completedActions: number
}

export function MeetingsPage({ meetings }: { meetings: Meeting[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [agenda, setAgenda] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, agenda }),
      })

      if (!res.ok) throw new Error("Failed to create meeting")

      setOpen(false)
      setTitle("")
      setDate("")
      setAgenda("")
      router.refresh()
      toast({ title: "Meeting created" })
    } catch {
      toast({ title: "Failed to create meeting", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meetings</h2>
          <p className="text-muted-foreground">
            Track meeting agendas, discussions, and action items
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Meeting</DialogTitle>
              <DialogDescription>
                Add a new meeting with agenda and details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Monthly Strategy Meeting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Agenda</Label>
                <Textarea
                  placeholder="Meeting agenda items..."
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Meeting"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {meetings.length > 0 ? (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
              <Card className="border-border/50 hover:border-primary/20 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(meeting.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {meeting.creatorName}
                        </span>
                      </div>
                    </div>
                    {meeting.actionCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <ListChecks className="mr-1 h-3 w-3" />
                        {meeting.completedActions}/{meeting.actionCount} actions
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {meeting.agenda && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {meeting.agenda}
                      </p>
                    </div>
                  )}
                  {meeting.decisions && (
                    <div className="flex items-start gap-2 mt-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {meeting.decisions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No meetings yet. Create your first meeting.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
