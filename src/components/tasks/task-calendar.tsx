"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  MoreHorizontal,
  Edit3,
  Trash2,
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
  priority: string
  status: string
  dueDate: Date | null
  assigneeName: string | null
}

interface Partner {
  id: string
  name: string
}

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
}

export function TaskCalendar({ tasks, partners }: { tasks: Task[]; partners: Partner[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/quick`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Status updated" })
      router.refresh()
    } catch {
      toast({ title: "Failed to update", variant: "destructive" })
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this task?")) return
    try {
      await fetch(`/api/tasks/${taskId}/quick`, { method: "DELETE" })
      toast({ title: "Task deleted" })
      router.refresh()
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" })
    }
  }

  // Get calendar grid
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Build calendar days
  const calendarDays: Array<{ date: Date | null; tasks: Task[] }> = []

  // Add empty cells for days before month start
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ date: null, tasks: [] })
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayTasks = tasks.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === month &&
        taskDate.getFullYear() === year
      )
    })
    calendarDays.push({ date, tasks: dayTasks })
  }

  // Pad to complete weeks
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({ date: null, tasks: [] })
  }

  const monthName = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })
  const today = new Date()
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (tasks.filter((t) => t.dueDate).length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            No tasks with due dates. Add due dates to see them on the calendar.
          </p>
          <Button asChild>
            <Link href="/tasks/new">Create Task</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {monthName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Day labels */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((cell, idx) => (
            <div
              key={idx}
              className={cn(
                "min-h-[100px] border border-border rounded-md p-1.5",
                !cell.date && "bg-muted/30",
                cell.date && isToday(cell.date) && "bg-primary/10 border-primary"
              )}
            >
              {cell.date && (
                <>
                  <div className={cn(
                    "text-xs font-medium mb-1",
                    isToday(cell.date) ? "text-primary" : "text-muted-foreground"
                  )}>
                    {cell.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {cell.tasks.slice(0, 3).map((task) => (
                      <DropdownMenu key={task.id}>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={cn(
                              "w-full text-left text-xs p-1 rounded text-white truncate hover:opacity-80 transition-opacity group",
                              priorityColors[task.priority]
                            )}
                          >
                            <div className="flex items-center gap-1">
                              {task.status === "completed" && <CheckSquare className="h-3 w-3 flex-shrink-0" />}
                              <span className="truncate flex-1">{task.title}</span>
                            </div>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem asChild>
                            <Link href={`/tasks/${task.id}`} className="gap-2">
                              <Edit3 className="h-3 w-3" />
                              Open Task
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {task.status !== "completed" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(task.id, "completed")}
                              className="gap-2"
                            >
                              <CheckSquare className="h-3 w-3" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          {task.status !== "in_progress" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(task.id, "in_progress")}
                              className="gap-2"
                            >
                              Start Working
                            </DropdownMenuItem>
                          )}
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
                    ))}
                    {cell.tasks.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{cell.tasks.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted-foreground" />
            <span>Low</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
