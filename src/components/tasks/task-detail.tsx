"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getInitials, formatFileSize } from "@/lib/utils"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  MessageSquare,
  Paperclip,
  Upload,
  Download,
  Trash2,
  Loader2,
  Calendar,
  User,
  CheckSquare,
  Plus,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface Comment {
  id: string
  content: string
  createdAt: Date
  userId: string
  userName: string
}

interface Attachment {
  id: string
  filename: string
  mimeType: string
  size: number
  minioKey: string
  createdAt: Date
  uploadedBy: string
  uploaderName: string
}

interface Subtask {
  id: string
  taskId: string
  title: string
  isCompleted: boolean
  orderIndex: number
  createdAt: Date
}

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: Date | null
  estimatedHours: number | null
  actualHours: number | null
  createdAt: Date
  updatedAt: Date
  assigneeId: string | null
  assigneeName: string | null
  creatorId: string
  creatorName: string
  comments: Comment[]
  attachments: Attachment[]
  subtasks: Subtask[]
}

interface Partner {
  id: string
  name: string
}

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
}

const statusColors: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  review: "bg-purple-500/10 text-purple-500",
  completed: "bg-green-500/10 text-green-500",
  blocked: "bg-red-500/10 text-red-500",
}

export function TaskDetail({ task, partners }: { task: Task; partners: Partner[] }) {
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(task.status)
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || [])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      })

      if (!res.ok) throw new Error("Failed to add comment")

      setComment("")
      router.refresh()
      toast({ title: "Comment added" })
    } catch (error) {
      toast({
        title: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update status")

      router.refresh()
      toast({ title: "Status updated" })
    } catch (error) {
      setStatus(task.status)
      toast({
        title: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      // Get signed upload URL
      const signRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      })

      if (!signRes.ok) throw new Error("Failed to get upload URL")

      const { url, key } = await signRes.json()

      // Upload to MinIO
      const uploadRes = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      if (!uploadRes.ok) throw new Error("Failed to upload file")

      // Save attachment record
      const attachRes = await fetch(`/api/tasks/${task.id}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          minioKey: key,
        }),
      })

      if (!attachRes.ok) throw new Error("Failed to save attachment")

      router.refresh()
      toast({ title: "File uploaded" })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      e.target.value = ""
    }
  }

  async function handleDownload(attachmentId: string) {
    try {
      const res = await fetch(`/api/attachments/${attachmentId}/download`)
      if (!res.ok) throw new Error("Failed to get download URL")

      const { url } = await res.json()
      window.open(url, "_blank")
    } catch (error) {
      toast({
        title: "Download failed",
        variant: "destructive",
      })
    }
  }

  async function handleAddSubtask(e: React.FormEvent) {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSubtaskTitle }),
      })

      if (!res.ok) throw new Error("Failed to add subtask")

      const newSubtask = await res.json()
      setSubtasks([...subtasks, newSubtask])
      setNewSubtaskTitle("")
      router.refresh()
      toast({ title: "Subtask added" })
    } catch (error) {
      toast({
        title: "Failed to add subtask",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleSubtask(subtaskId: string, isCompleted: boolean) {
    try {
      const res = await fetch(`/api/tasks/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      })

      if (!res.ok) throw new Error("Failed to toggle subtask")

      setSubtasks(subtasks.map(s => 
        s.id === subtaskId ? { ...s, isCompleted: !isCompleted } : s
      ))
      router.refresh()
    } catch (error) {
      toast({
        title: "Failed to update subtask",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteSubtask(subtaskId: string) {
    try {
      const res = await fetch(`/api/tasks/subtasks/${subtaskId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete subtask")

      setSubtasks(subtasks.filter(s => s.id !== subtaskId))
      router.refresh()
      toast({ title: "Subtask deleted" })
    } catch (error) {
      toast({
        title: "Failed to delete subtask",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/tasks">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
          <p className="text-sm text-muted-foreground">
            Created by {task.creatorName} on {formatDate(task.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <p className="text-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">No description</p>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({task.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.comments.length > 0 ? (
                <div className="space-y-4">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(comment.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              )}

              <form onSubmit={handleAddComment} className="space-y-2 pt-4 border-t">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <Button type="submit" disabled={loading || !comment.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Comment"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Attachments ({task.attachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.attachments.length > 0 ? (
                <div className="space-y-2">
                  {task.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{attachment.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.size)} • Uploaded by{" "}
                            {attachment.uploaderName}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(attachment.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No attachments</p>
              )}

              <div className="pt-4 border-t">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Subtasks ({subtasks.filter(s => s.isCompleted).length}/{subtasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subtasks.length > 0 ? (
                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={subtask.isCompleted}
                        onChange={() => handleToggleSubtask(subtask.id, subtask.isCompleted)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span
                        className={cn(
                          "flex-1 text-sm",
                          subtask.isCompleted && "line-through text-muted-foreground"
                        )}
                      >
                        {subtask.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subtasks yet</p>
              )}

              <form onSubmit={handleAddSubtask} className="flex gap-2 pt-4 border-t">
                <Input
                  placeholder="Add a subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !newSubtaskTitle.trim()}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={status} onValueChange={handleStatusChange}>
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
            </CardContent>
          </Card>

          {/* Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={cn("text-sm", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
            </CardContent>
          </Card>

          {/* Assignee */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Assignee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {task.assigneeName || "Unassigned"}
              </p>
            </CardContent>
          </Card>

          {/* Due Date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {task.dueDate ? formatDate(task.dueDate) : "No due date"}
              </p>
            </CardContent>
          </Card>

          {/* Time Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Estimated</p>
                <p className="text-sm font-medium">
                  {task.estimatedHours ? `${task.estimatedHours} hours` : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actual</p>
                <p className="text-sm font-medium">
                  {task.actualHours ? `${task.actualHours} hours` : "Not logged"}
                </p>
              </div>
              {task.estimatedHours && task.actualHours && (
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    variant={task.actualHours > task.estimatedHours ? "destructive" : "default"}
                    className="text-xs"
                  >
                    {task.actualHours > task.estimatedHours ? "Over budget" : "On track"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
