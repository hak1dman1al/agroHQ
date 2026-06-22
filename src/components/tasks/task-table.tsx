"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import {
  CheckSquare,
  MoreHorizontal,
  Edit3,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Circle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Ban,
  Eye,
  MessageSquare,
  Paperclip,
} from "lucide-react"
import Link from "next/link"

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: Date | null
  createdAt: Date
  assigneeName: string | null
  creatorName: string
}

interface Partner {
  id: string
  name: string
}

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-muted",
  medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusIcons: Record<string, React.ReactNode> = {
  todo: <Circle className="h-4 w-4 text-muted-foreground" />,
  in_progress: <Clock className="h-4 w-4 text-primary" />,
  review: <Eye className="h-4 w-4 text-purple-500" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  blocked: <Ban className="h-4 w-4 text-red-500" />,
}

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
  blocked: "Blocked",
}

export function TaskTable({ tasks, partners }: { tasks: Task[]; partners: Partner[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")

  const handleQuickStatusChange = async (taskId: string, newStatus: string) => {
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

  const handleQuickPriorityChange = async (taskId: string, newPriority: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/quick`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      })

      if (!res.ok) throw new Error("Failed to update priority")

      toast({ title: "Priority updated" })
      router.refresh()
    } catch (error) {
      toast({
        title: "Failed to update priority",
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

  const toggleSelectTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTasks.map((t) => t.id))
    }
  }

  // Filter and sort tasks
  let filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Sort tasks
  filteredTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "createdAt") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortBy === "dueDate") {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    } else if (sortBy === "priority") {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) -
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 4)
    } else if (sortBy === "status") {
      const statusOrder = { blocked: 0, todo: 1, in_progress: 2, review: 3, completed: 4 }
      return (statusOrder[a.status as keyof typeof statusOrder] || 5) -
             (statusOrder[b.status as keyof typeof statusOrder] || 5)
    }
    return 0
  })

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
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedTasks.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{selectedTasks.length} selected</Badge>
            <Button variant="outline" size="sm">
              Bulk Actions
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 w-10">
                  <Checkbox
                    checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                  Task
                </th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground w-[140px]">
                  Status
                </th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground w-[120px]">
                  Priority
                </th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground w-[140px]">
                  Assignee
                </th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground w-[120px]">
                  Due Date
                </th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground w-[80px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const dueDate = task.dueDate ? new Date(task.dueDate) : null
                const isOverdue = dueDate && dueDate < new Date() && task.status !== "completed"

                return (
                  <tr
                    key={task.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group"
                  >
                    <td className="p-3">
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => toggleSelectTask(task.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {task.title}
                        </Link>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-auto p-1 gap-2">
                            {statusIcons[task.status]}
                            <span className="text-xs">{statusLabels[task.status]}</span>
                            <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <DropdownMenuItem
                              key={value}
                              onClick={() => handleQuickStatusChange(task.id, value)}
                              className="gap-2"
                            >
                              {statusIcons[value]}
                              {label}
                              {task.status === value && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-auto p-1">
                            <Badge className={cn("text-xs", priorityColors[task.priority])}>
                              {task.priority}
                            </Badge>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {["critical", "high", "medium", "low"].map((priority) => (
                            <DropdownMenuItem
                              key={priority}
                              onClick={() => handleQuickPriorityChange(task.id, priority)}
                              className="gap-2"
                            >
                              <Badge className={cn("text-xs", priorityColors[priority])}>
                                {priority}
                              </Badge>
                              {task.priority === priority && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-foreground">
                        {task.assigneeName || "Unassigned"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "text-sm",
                          isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"
                        )}
                      >
                        {dueDate ? formatDate(dueDate) : "—"}
                      </span>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs ml-2">
                          Overdue
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/tasks/${task.id}`} className="gap-2">
                              <ExternalLink className="h-4 w-4" />
                              Open Task
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/tasks/${task.id}?edit=true`} className="gap-2">
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(task.id)}
                            className="gap-2 text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No tasks match your filters</p>
          </CardContent>
        )}
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredTasks.length} of {tasks.length} tasks
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Circle className="h-3 w-3 text-muted-foreground" />
            {tasks.filter((t) => t.status === "todo").length} To Do
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary" />
            {tasks.filter((t) => t.status === "in_progress").length} In Progress
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            {tasks.filter((t) => t.status === "completed").length} Completed
          </span>
        </div>
      </div>
    </div>
  )
}
