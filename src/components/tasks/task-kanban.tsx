"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckSquare } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: Date | null
  assigneeName: string | null
}

interface Partner {
  id: string
  name: string
}

const columns = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "completed", label: "Completed" },
  { id: "blocked", label: "Blocked" },
]

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
}

export function TaskKanban({ tasks, partners }: { tasks: Task[]; partners: Partner[] }) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No tasks yet. Create your first task.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id)
        return (
          <Card key={column.id} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{column.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnTasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-border bg-background hover:border-primary/20 transition-colors cursor-pointer"
                >
                  <p className="font-medium text-sm text-foreground mb-2">
                    {task.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className={cn("text-xs", priorityColors[task.priority])}>
                      {task.priority}
                    </Badge>
                    {task.assigneeName && (
                      <span className="text-xs text-muted-foreground">
                        {task.assigneeName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {columnTasks.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">No tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
