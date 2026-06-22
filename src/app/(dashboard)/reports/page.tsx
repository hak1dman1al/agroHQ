export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { tasks, partners, meetings, progressUpdates, roadmaps, financialTransactions, capitalContributions } from "@/lib/db/schema"
import { sql, eq, desc } from "drizzle-orm"
import { ReportsPage } from "@/components/reports/reports-page"

async function getReportData() {
  try {
    // Task statistics
    const [taskStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        completed: sql<number>`count(*) filter (where ${tasks.status} = 'completed')::int`,
        inProgress: sql<number>`count(*) filter (where ${tasks.status} = 'in_progress')::int`,
        blocked: sql<number>`count(*) filter (where ${tasks.status} = 'blocked')::int`,
        overdue: sql<number>`count(*) filter (where ${tasks.dueDate} < NOW() AND ${tasks.status} != 'completed')::int`,
      })
      .from(tasks)

    // Partner count
    const [partnerStats] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(partners)

    // Meeting count
    const [meetingStats] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(meetings)

    // Update count
    const [updateStats] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(progressUpdates)

    // Roadmap progress
    const roadmapList = await db.select().from(roadmaps)
    const avgProgress = roadmapList.length > 0
      ? Math.round(roadmapList.reduce((sum, r) => sum + r.completionPercentage, 0) / roadmapList.length)
      : 0

    // Financial summary
    const [financialStats] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${financialTransactions.type} = 'revenue' THEN ${financialTransactions.amount} ELSE 0 END), 0)`.mapWith(Number),
        totalExpenses: sql<number>`COALESCE(SUM(CASE WHEN ${financialTransactions.type} = 'expense' THEN ${financialTransactions.amount} ELSE 0 END), 0)`.mapWith(Number),
      })
      .from(financialTransactions)

    const [capitalStats] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${capitalContributions.amount}), 0)`.mapWith(Number),
      })
      .from(capitalContributions)

    // Recent activities
    const recentActivities = await db
      .select()
      .from(progressUpdates)
      .orderBy(desc(progressUpdates.createdAt))
      .limit(5)

    return {
      tasks: taskStats || { total: 0, completed: 0, inProgress: 0, blocked: 0, overdue: 0 },
      partners: partnerStats?.count || 0,
      meetings: meetingStats?.count || 0,
      updates: updateStats?.count || 0,
      roadmapProgress: avgProgress,
      financial: {
        revenue: financialStats?.totalRevenue || 0,
        expenses: financialStats?.totalExpenses || 0,
        capital: capitalStats?.total || 0,
      },
      recentActivities,
    }
  } catch (error) {
    console.error("Failed to fetch report data:", error)
    return {
      tasks: { total: 0, completed: 0, inProgress: 0, blocked: 0, overdue: 0 },
      partners: 0,
      meetings: 0,
      updates: 0,
      roadmapProgress: 0,
      financial: { revenue: 0, expenses: 0, capital: 0 },
      recentActivities: [],
    }
  }
}

export default async function ReportsRoute() {
  const data = await getReportData()
  return <ReportsPage data={data} />
}
