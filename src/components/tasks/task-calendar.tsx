"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon, CheckSquare } from "lucide-react"

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
  low: "border-l-muted",
  medium: "border-l-blue-500",
  high: "border-l-orange-500",
  critical: "border-l-red-500",
}

export function TaskCalendar({ tasks, partners }: { tasks: Task[]; partners: Partner[] }) {
  const tasksWithDates = tasks.filter((t) => t.dueDate)
  const upcomingTasks = tasksWithDates
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 10)

  if (tasksWithDates.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No tasks with due dates. Add due dates to see them here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Upcoming Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {upcomingTasks.map((task) => {
            const dueDate = new Date(task.dueDate!)
            const isOverdue = dueDate < new Date() && task.status !== "completed"
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border border-border border-l-4",
                  priorityColors[task.priority]
                )}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {task.assigneeName || "Unassigned"}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-medium",
                    isOverdue ? "text-red-500" : "text-foreground"
                  )}>
                    {dueDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
