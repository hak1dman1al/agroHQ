"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  CheckCircle2,
  Users,
  Calendar,
  Megaphone,
  Map,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
} from "lucide-react"

interface ReportData {
  tasks: {
    total: number
    completed: number
    inProgress: number
    blocked: number
    overdue: number
  }
  partners: number
  meetings: number
  updates: number
  roadmapProgress: number
  financial: {
    revenue: number
    expenses: number
    capital: number
  }
  recentActivities: any[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
  }).format(amount / 100)
}

export function ReportsPage({ data }: { data: ReportData }) {
  const taskCompletionRate = data.tasks.total > 0
    ? Math.round((data.tasks.completed / data.tasks.total) * 100)
    : 0

  const profit = data.financial.revenue - data.financial.expenses
  const burnRate = data.financial.expenses
  const runway = data.financial.capital > 0 && burnRate > 0
    ? Math.round(data.financial.capital / (burnRate / 12))
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Comprehensive analytics and business intelligence
        </p>
      </div>

      {/* Executive Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCompletionRate}%</div>
            <Progress value={taskCompletionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {data.tasks.completed} of {data.tasks.total} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-gold-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roadmap Progress</CardTitle>
            <Map className="h-4 w-4 text-gold-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.roadmapProgress}%</div>
            <Progress value={data.roadmapProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Average across all phases
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            {profit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatCurrency(profit)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Revenue - Expenses
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.partners}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Active partners
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Task Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <Progress
                      value={data.tasks.total > 0 ? (data.tasks.completed / data.tasks.total) * 100 : 0}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{data.tasks.completed}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <Progress
                      value={data.tasks.total > 0 ? (data.tasks.inProgress / data.tasks.total) * 100 : 0}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{data.tasks.inProgress}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Blocked</span>
                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <Progress
                      value={data.tasks.total > 0 ? (data.tasks.blocked / data.tasks.total) * 100 : 0}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-red-400">{data.tasks.blocked}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overdue</span>
                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <Progress
                      value={data.tasks.total > 0 ? (data.tasks.overdue / data.tasks.total) * 100 : 0}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-orange-400">{data.tasks.overdue}</span>
                </div>
              </div>
            </div>

            {data.tasks.overdue > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-orange-400">
                  {data.tasks.overdue} task{data.tasks.overdue > 1 ? "s" : ""} overdue
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Capital</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(data.financial.capital)}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-lg font-bold text-green-400">
                  {formatCurrency(data.financial.revenue)}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="text-lg font-bold text-red-400">
                  {formatCurrency(data.financial.expenses)}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cash Balance</span>
                <span className="text-sm font-bold text-gold-400">
                  {formatCurrency(data.financial.capital + data.financial.revenue - data.financial.expenses)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profit Margin</span>
                <span className="text-sm font-bold">
                  {data.financial.revenue > 0
                    ? Math.round((profit / data.financial.revenue) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold">{data.meetings}</p>
                <p className="text-xs text-muted-foreground">Meetings</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center">
                <Megaphone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold">{data.updates}</p>
                <p className="text-xs text-muted-foreground">Updates</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold">{data.partners}</p>
                <p className="text-xs text-muted-foreground">Partners</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold">{data.tasks.total}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Score */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const taskScore = taskCompletionRate * 0.3
              const roadmapScore = data.roadmapProgress * 0.3
              const financialScore = profit >= 0 ? 40 : Math.max(0, 40 + (profit / 10000))
              const activityScore = Math.min(40, (data.meetings + data.updates) * 2)
              const totalScore = Math.round(taskScore + roadmapScore + (profit >= 0 ? 30 : 10) + Math.min(10, activityScore / 4))
              const clampedScore = Math.min(100, Math.max(0, totalScore))

              const color = clampedScore >= 70 ? "text-green-400" : clampedScore >= 40 ? "text-gold-400" : "text-red-400"
              const label = clampedScore >= 70 ? "Excellent" : clampedScore >= 40 ? "Good" : "Needs Attention"

              return (
                <div className="text-center space-y-4">
                  <div className={`text-6xl font-bold ${color}`}>
                    {clampedScore}
                  </div>
                  <div className={`text-lg font-medium ${color}`}>
                    {label}
                  </div>
                  <Progress value={clampedScore} className="h-3" />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Tasks</p>
                      <p className="font-medium">{taskCompletionRate}%</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Roadmap</p>
                      <p className="font-medium">{data.roadmapProgress}%</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Financial</p>
                      <p className="font-medium">{profit >= 0 ? "Positive" : "Negative"}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Activity</p>
                      <p className="font-medium">{data.meetings + data.updates} events</p>
                    </div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
