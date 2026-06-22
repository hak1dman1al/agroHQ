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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { formatDate } from "@/lib/utils"
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  CheckCircle2,
  ListChecks,
  Plus,
  Loader2,
  Edit3,
  Save,
  Calendar,
  Download,
} from "lucide-react"
import Link from "next/link"

interface Action {
  id: string
  title: string
  status: string
  dueDate: Date | null
  assigneeId: string | null
  assigneeName: string | null
}

interface Meeting {
  id: string
  title: string
  date: Date
  agenda: string | null
  discussion: string | null
  decisions: string | null
  createdBy: string
  creatorName: string
  createdAt: Date
  actions: Action[]
}

interface Partner {
  id: string
  name: string
}

const statusColors: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  review: "bg-purple-500/10 text-purple-500",
  completed: "bg-green-500/10 text-green-500",
  blocked: "bg-red-500/10 text-red-500",
}

export function MeetingDetail({ meeting, partners }: { meeting: Meeting; partners: Partner[] }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [actionOpen, setActionOpen] = useState(false)
  const [actionTitle, setActionTitle] = useState("")
  const [actionAssignee, setActionAssignee] = useState("")
  const [actionDue, setActionDue] = useState("")
  const [loading, setLoading] = useState(false)
  const { session } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isAdmin = session?.user?.role === "admin"

  async function saveField(field: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/meetings/${meeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: editValue }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setEditing(null)
      router.refresh()
      toast({ title: "Updated" })
    } catch {
      toast({ title: "Failed to update", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function addAction(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: actionTitle,
          assigneeId: actionAssignee || null,
          dueDate: actionDue || null,
        }),
      })
      if (!res.ok) throw new Error("Failed to add action")
      setActionOpen(false)
      setActionTitle("")
      setActionAssignee("")
      setActionDue("")
      router.refresh()
      toast({ title: "Action item added" })
    } catch {
      toast({ title: "Failed to add action", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function updateActionStatus(actionId: string, status: string) {
    try {
      await fetch(`/api/meetings/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } catch {
      toast({ title: "Failed to update", variant: "destructive" })
    }
  }

  function startEdit(field: string, value: string | null) {
    setEditing(field)
    setEditValue(value || "")
  }

  function handleExportICS() {
    window.open(`/api/meetings/${meeting.id}/ics`, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/meetings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{meeting.title}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(meeting.date)} • Created by {meeting.creatorName}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportICS}>
          <Download className="mr-2 h-4 w-4" />
          Export to Calendar
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agenda */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Agenda
            </CardTitle>
            {isAdmin && editing !== "agenda" && (
              <Button variant="ghost" size="sm" onClick={() => startEdit("agenda", meeting.agenda)}>
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editing === "agenda" ? (
              <div className="space-y-2">
                <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={6} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveField("agenda")} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap text-foreground">
                {meeting.agenda || "No agenda set"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Discussion */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Discussion Notes
            </CardTitle>
            {isAdmin && editing !== "discussion" && (
              <Button variant="ghost" size="sm" onClick={() => startEdit("discussion", meeting.discussion)}>
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editing === "discussion" ? (
              <div className="space-y-2">
                <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={6} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveField("discussion")} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap text-foreground">
                {meeting.discussion || "No discussion notes"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Decisions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Key Decisions
            </CardTitle>
            {isAdmin && editing !== "decisions" && (
              <Button variant="ghost" size="sm" onClick={() => startEdit("decisions", meeting.decisions)}>
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editing === "decisions" ? (
              <div className="space-y-2">
                <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={6} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveField("decisions")} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap text-foreground">
                {meeting.decisions || "No decisions recorded"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Action Items ({meeting.actions.length})
            </CardTitle>
            <Dialog open={actionOpen} onOpenChange={setActionOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Action Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={addAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={actionTitle}
                      onChange={(e) => setActionTitle(e.target.value)}
                      placeholder="Action item description"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Assignee</Label>
                      <Select value={actionAssignee} onValueChange={setActionAssignee}>
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          {partners.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input type="date" value={actionDue} onChange={(e) => setActionDue(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setActionOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Action"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {meeting.actions.length > 0 ? (
              <div className="space-y-3">
                {meeting.actions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {action.assigneeName && (
                          <span className="text-xs text-muted-foreground">{action.assigneeName}</span>
                        )}
                        {action.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Due: {formatDate(action.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Select
                      value={action.status}
                      onValueChange={(v) => updateActionStatus(action.id, v)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No action items</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
