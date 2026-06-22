"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { CheckSquare } from "lucide-react"

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

export function TaskTable({ tasks, partners }: { tasks: Task[]; partners: Partner[] }) {
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
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Assignee</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Priority</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-foreground">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-4 text-sm text-foreground">
                  {task.assigneeName || "Unassigned"}
                </td>
                <td className="p-4">
                  <Badge className={cn("text-xs", priorityColors[task.priority])}>
                    {task.priority}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge className={cn("text-xs", statusColors[task.status])}>
                    {task.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {task.dueDate ? formatDate(task.dueDate) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
