export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { tasks, partners, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { TaskTable } from "@/components/tasks/task-table"
import { TaskKanban } from "@/components/tasks/task-kanban"
import { TaskCalendar } from "@/components/tasks/task-calendar"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckSquare, LayoutGrid, Calendar } from "lucide-react"

async function getTasks() {
  try {
    const taskList = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        priority: tasks.priority,
        status: tasks.status,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        assigneeId: tasks.assigneeId,
        assigneeName: partners.name,
        creatorName: users.name,
      })
      .from(tasks)
      .leftJoin(partners, eq(tasks.assigneeId, partners.id))
      .innerJoin(users, eq(tasks.createdBy, users.id))
      .orderBy(tasks.createdAt)

    return taskList
  } catch {
    return []
  }
}

async function getPartners() {
  try {
    const partnerList = await db
      .select({
        id: partners.id,
        name: partners.name,
      })
      .from(partners)

    return partnerList
  } catch {
    return []
  }
}

export default async function TasksPage() {
  const [taskList, partnerList] = await Promise.all([
    getTasks(),
    getPartners(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Manage and track your team's tasks
          </p>
        </div>
        <CreateTaskDialog partners={partnerList} />
      </div>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Table
          </TabsTrigger>
          <TabsTrigger value="kanban" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <TaskTable tasks={taskList} partners={partnerList} />
        </TabsContent>

        <TabsContent value="kanban">
          <TaskKanban tasks={taskList} partners={partnerList} />
        </TabsContent>

        <TabsContent value="calendar">
          <TaskCalendar tasks={taskList} partners={partnerList} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
