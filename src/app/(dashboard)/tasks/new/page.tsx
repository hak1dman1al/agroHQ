"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  CheckSquare,
  Loader2,
  Sparkles,
  Zap,
  Calendar,
  User,
  Flag,
  FileText,
  Paperclip,
  Link as LinkIcon,
} from "lucide-react"

interface Partner {
  id: string
  name: string
}

export function NewTaskPage({ partners }: { partners: Partner[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [priority, setPriority] = useState("medium")
  const [status, setStatus] = useState("todo")
  const [dueDate, setDueDate] = useState("")
  const [tags, setTags] = useState("")

  const quickFillTemplates = [
    {
      label: "Bug Fix",
      title: "Fix bug: ",
      priority: "high",
      description: "Steps to reproduce:\n1.\n2.\n3.\n\nExpected behavior:\n\nActual behavior:",
    },
    {
      label: "Feature Request",
      title: "Add feature: ",
      priority: "medium",
      description: "User story:\nAs a [user]\nI want to [action]\nSo that [benefit]\n\nAcceptance criteria:\n- \n- ",
    },
    {
      label: "Meeting Action",
      title: "Follow up: ",
      priority: "medium",
      description: "From meeting:\nDate:\nAction items:",
    },
  ]

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          assigneeId: assigneeId || null,
          priority,
          status,
          dueDate: dueDate || null,
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        }),
      })

      if (!res.ok) throw new Error("Failed to create task")

      const task = await res.json()
      toast({ title: "Task created" })
      router.push(`/tasks/${task.id}`)
    } catch (error) {
      toast({ title: "Failed to create task", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/tasks">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Task</h1>
          <p className="text-muted-foreground">
            Create a new task and assign it to your team
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Quick Fill Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {quickFillTemplates.map((template) => (
                <Button
                  key={template.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTitle(template.title)
                    setDescription(template.description)
                    setPriority(template.priority)
                  }}
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Prepare Q2 financial report"
                required
                autoFocus
                className="text-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center gap-1">
                  <CheckSquare className="h-3 w-3" />
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="flex items-center gap-1">
                  <Flag className="h-3 w-3" />
                  Priority
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🔵 Medium</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="critical">🔴 Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Assignee
                </Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details, context, or instructions..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., urgent, finance, q2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/tasks">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Create Task
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
