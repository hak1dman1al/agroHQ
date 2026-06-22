"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, getInitials } from "@/lib/utils"
import {
  CheckSquare,
  MoreHorizontal,
  Edit3,
  Trash2,
  ExternalLink,
  Circle,
  Clock,
  CheckCircle2,
  Eye,
  Ban,
  Paperclip,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: Date | null
  assigneeName: string | null
  creatorName: string
  createdAt: Date
}

interface Partner {
  id: string
  name: string
}

const columns = [
  { id: "todo", label: "To Do", icon: Circle, color: "text-muted-foreground" },
  { id: "in_progress", label: "In Progress", icon: Clock, color: "text-primary" },
  { id: "review", label: "Review", icon: Eye, color: "text-purple-500" },
  { id: "completed", label: "Completed", icon: CheckCircle2, color: "text-green-500" },
  { id: "blocked", label: "Blocked", icon: Ban, color: "text-red-500" },
]

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
}

const priorityBorders: Record<string, string> = {
  low: "border-l-muted-foreground",
  medium: "border-l-blue-500",
  high: "border-l-orange-500",
  critical: "border-l-red-500",
}

export function TaskKanban({ tasks, partners }: { tasks: Task[]; partners: Partner[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/quick`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update status")

      toast({ title: "Status updated" })
      router.refresh()
    } catch (error) {
      toast({
        title: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const res = await fetch(`/api/tasks/${taskId}/quick`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete task")

      toast({ title: "Task deleted" })
      router.refresh()
    } catch (error) {
      toast({
        title: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (draggedTask) {
      handleStatusChange(draggedTask, columnId)
      setDraggedTask(null)
    }
  }

  const toggleSelectTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    )
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No tasks yet. Create your first task.</p>
          <Button asChild>
            <Link href="/tasks/new">Create Task</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {selectedTasks.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2">
            <Badge variant="default">{selectedTasks.length} selected</Badge>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTasks([])}>
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Change Status
            </Button>
            <Button variant="outline" size="sm">
              Assign
            </Button>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id)
          const Icon = column.icon
          const isDragOver = dragOverColumn === column.id

          return (
            <Card
              key={column.id}
              className={cn(
                "border-border/50 transition-all",
                isDragOver && "border-primary bg-primary/5 scale-[1.02]"
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", column.color)} />
                    <h3 className="font-semibold text-sm">{column.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 min-h-[100px]">
                {columnTasks.map((task) => {
                  const dueDate = task.dueDate ? new Date(task.dueDate) : null
                  const isOverdue = dueDate && dueDate < new Date() && task.status !== "completed"

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className={cn(
                        "p-3 rounded-lg border border-l-4 bg-background hover:border-primary/40 transition-all cursor-move group",
                        priorityBorders[task.priority],
                        selectedTasks.includes(task.id) && "ring-2 ring-primary"
                      )}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={() => toggleSelectTask(task.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/tasks/${task.id}`}
                            className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2"
                          >
                            {task.title}
                          </Link>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/tasks/${task.id}`} className="gap-2">
                                <ExternalLink className="h-3 w-3" />
                                Open
                              </Link>
                            </DropdownMenuItem>
                            {columns
                              .filter((c) => c.id !== task.status)
                              .map((c) => {
                                const CIcon = c.icon
                                return (
                                  <DropdownMenuItem
                                    key={c.id}
                                    onClick={() => handleStatusChange(task.id, c.id)}
                                    className="gap-2"
                                  >
                                    <CIcon className="h-3 w-3" />
                                    Move to {c.label}
                                  </DropdownMenuItem>
                                )
                              })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(task.id)}
                              className="gap-2 text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between gap-2 ml-6">
                        <Badge className={cn("text-xs", priorityColors[task.priority])}>
                          {task.priority}
                        </Badge>
                        {task.assigneeName && (
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold">
                              {getInitials(task.assigneeName)}
                            </div>
                          </div>
                        )}
                      </div>

                      {dueDate && (
                        <div className="mt-2 ml-6">
                          <span
                            className={cn(
                              "text-xs",
                              isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"
                            )}
                          >
                            {isOverdue && "⚠️ "}
                            {formatDate(dueDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}

                {columnTasks.length === 0 && (
                  <div className="py-8 text-center border-2 border-dashed border-border rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Drop tasks here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
