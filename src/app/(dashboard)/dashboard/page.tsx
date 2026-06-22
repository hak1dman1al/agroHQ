export const dynamic = "force-dynamic"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Leaf,
  TrendingUp,
  Users,
  CheckCircle2,
  Calendar,
  DollarSign,
  Map,
  Activity,
} from "lucide-react"
import { db } from "@/lib/db/client"
import { tasks, activities, partners, users } from "@/lib/db/schema"
import { sql, desc, eq } from "drizzle-orm"
import { formatRelativeTime } from "@/lib/utils"
import Link from "next/link"

async function getDashboardData() {
  try {
    const [taskStats, partnerCount, recentActivities] = await Promise.all([
      db
        .select({
          total: sql<number>`count(*)::int`,
          completed: sql<number>`count(*) filter (where ${tasks.status} = 'completed')::int`,
          inProgress: sql<number>`count(*) filter (where ${tasks.status} = 'in_progress')::int`,
        })
        .from(tasks),
      db.select({ count: sql<number>`count(*)::int` }).from(partners),
      db
        .select({
          id: activities.id,
          action: activities.action,
          entityType: activities.entityType,
          entityId: activities.entityId,
          details: activities.details,
          createdAt: activities.createdAt,
          userName: users.name,
        })
        .from(activities)
        .innerJoin(users, eq(activities.userId, users.id))
        .orderBy(desc(activities.createdAt))
        .limit(10),
    ])

    return {
      taskStats: taskStats[0] || { total: 0, completed: 0, inProgress: 0 },
      partnerCount: partnerCount[0]?.count || 0,
      recentActivities,
    }
  } catch {
    return {
      taskStats: { total: 0, completed: 0, inProgress: 0 },
      partnerCount: 0,
      recentActivities: [],
    }
  }
}

export default async function DashboardPage() {
  const { taskStats, partnerCount, recentActivities } = await getDashboardData()

  const completionRate = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">
          Here's an overview of your agro operations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {taskStats.inProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partnerCount}</div>
            <p className="text-xs text-muted-foreground">Active shareholders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Startup</div>
            <p className="text-xs text-muted-foreground">2026-2027</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.userName}</span>{" "}
                        {activity.details || activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  No activities yet. Start by creating tasks or inviting partners.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/tasks">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Create New Task
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/organization">
                <Users className="mr-2 h-4 w-4" />
                Invite Partner
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/meetings">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/documents">
                <Leaf className="mr-2 h-4 w-4" />
                Upload Document
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
