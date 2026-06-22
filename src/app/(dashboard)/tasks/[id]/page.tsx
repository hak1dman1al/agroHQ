export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { tasks, taskComments, taskAttachments, taskSubtasks, partners, users } from "@/lib/db/schema"
import { eq, desc, asc } from "drizzle-orm"
import { notFound } from "next/navigation"
import { TaskDetail } from "@/components/tasks/task-detail"

async function getTask(id: string) {
  try {
    const task = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        priority: tasks.priority,
        status: tasks.status,
        dueDate: tasks.dueDate,
        estimatedHours: tasks.estimatedHours,
        actualHours: tasks.actualHours,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        assigneeId: tasks.assigneeId,
        assigneeName: partners.name,
        creatorId: tasks.createdBy,
        creatorName: users.name,
      })
      .from(tasks)
      .leftJoin(partners, eq(tasks.assigneeId, partners.id))
      .innerJoin(users, eq(tasks.createdBy, users.id))
      .where(eq(tasks.id, id))
      .limit(1)

    if (task.length === 0) {
      return null
    }

    const comments = await db
      .select({
        id: taskComments.id,
        content: taskComments.content,
        createdAt: taskComments.createdAt,
        userId: taskComments.userId,
        userName: users.name,
      })
      .from(taskComments)
      .innerJoin(users, eq(taskComments.userId, users.id))
      .where(eq(taskComments.taskId, id))
      .orderBy(desc(taskComments.createdAt))

    const attachments = await db
      .select({
        id: taskAttachments.id,
        filename: taskAttachments.filename,
        mimeType: taskAttachments.mimeType,
        size: taskAttachments.size,
        minioKey: taskAttachments.minioKey,
        createdAt: taskAttachments.createdAt,
        uploadedBy: taskAttachments.uploadedBy,
        uploaderName: users.name,
      })
      .from(taskAttachments)
      .innerJoin(users, eq(taskAttachments.uploadedBy, users.id))
      .where(eq(taskAttachments.taskId, id))
      .orderBy(desc(taskAttachments.createdAt))

    const subtasks = await db
      .select()
      .from(taskSubtasks)
      .where(eq(taskSubtasks.taskId, id))
      .orderBy(asc(taskSubtasks.orderIndex), asc(taskSubtasks.createdAt))

    return {
      ...task[0],
      comments,
      attachments,
      subtasks,
    }
  } catch (error) {
    console.error("Failed to fetch task:", error)
    return null
  }
}

async function getPartners() {
  try {
    return await db
      .select({
        id: partners.id,
        name: partners.name,
      })
      .from(partners)
  } catch {
    return []
  }
}

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const task = await getTask(params.id)
  
  if (!task) {
    notFound()
  }

  const partnerList = await getPartners()

  return <TaskDetail task={task} partners={partnerList} />
}
