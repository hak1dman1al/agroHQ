"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Loader2,
  BarChart3,
} from "lucide-react"

interface Contribution {
  id: string
  partnerId: string
  partnerName: string
  amount: number
  date: Date
  notes: string | null
}

interface Transaction {
  id: string
  type: string
  category: string
  amount: number
  date: Date
  description: string | null
}

interface Partner {
  id: string
  name: string
}

interface FinancialData {
  contributions: Contribution[]
  transactions: Transaction[]
  totalContributions: number
  totalExpenses: number
  totalRevenue: number
  monthlyExpenses: Record<string, number>
  monthlyRevenue: Record<string, number>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
  }).format(amount / 100)
}

export function FinancialPage({ data, partners }: { data: FinancialData; partners: Partner[] }) {
  const [contribDialogOpen, setContribDialogOpen] = useState(false)
  const [transDialogOpen, setTransDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Contribution form
  const [contribPartner, setContribPartner] = useState("")
  const [contribAmount, setContribAmount] = useState("")
  const [contribDate, setContribDate] = useState("")
  const [contribNotes, setContribNotes] = useState("")

  // Transaction form
  const [transType, setTransType] = useState("expense")
  const [transCategory, setTransCategory] = useState("")
  const [transAmount, setTransAmount] = useState("")
  const [transDate, setTransDate] = useState("")
  const [transDesc, setTransDesc] = useState("")

  const cashBalance = data.totalContributions + data.totalRevenue - data.totalExpenses

  async function addContribution(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/financial/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: contribPartner,
          amount: Math.round(parseFloat(contribAmount) * 100),
          date: contribDate,
          notes: contribNotes,
        }),
      })
      if (!res.ok) throw new Error("Failed")

      setContribDialogOpen(false)
      setContribPartner("")
      setContribAmount("")
      setContribDate("")
      setContribNotes("")
      router.refresh()
      toast({ title: "Contribution added" })
    } catch {
      toast({ title: "Failed to add contribution", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function addTransaction(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/financial/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: transType,
          category: transCategory,
          amount: Math.round(parseFloat(transAmount) * 100),
          date: transDate,
          description: transDesc,
        }),
      })
      if (!res.ok) throw new Error("Failed")

      setTransDialogOpen(false)
      setTransCategory("")
      setTransAmount("")
      setTransDate("")
      setTransDesc("")
      router.refresh()
      toast({ title: "Transaction added" })
    } catch {
      toast({ title: "Failed to add transaction", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial</h2>
          <p className="text-muted-foreground">
            Capital, expenses, revenue, and cash flow overview
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={contribDialogOpen} onOpenChange={setContribDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Contribution
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Capital Contribution</DialogTitle>
              </DialogHeader>
              <form onSubmit={addContribution} className="space-y-4">
                <div className="space-y-2">
                  <Label>Partner</Label>
                  <Select value={contribPartner} onValueChange={setContribPartner}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount (MYR)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={contribAmount}
                      onChange={(e) => setContribAmount(e.target.value)}
                      placeholder="10000.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={contribDate}
                      onChange={(e) => setContribDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={contribNotes}
                    onChange={(e) => setContribNotes(e.target.value)}
                    placeholder="Initial capital, second tranche..."
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setContribDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={transDialogOpen} onOpenChange={setTransDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={addTransaction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={transType} onValueChange={setTransType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={transCategory}
                      onChange={(e) => setTransCategory(e.target.value)}
                      placeholder="Land, Seeds, Sales..."
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount (MYR)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={transAmount}
                      onChange={(e) => setTransAmount(e.target.value)}
                      placeholder="5000.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={transDate}
                      onChange={(e) => setTransDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={transDesc}
                    onChange={(e) => setTransDesc(e.target.value)}
                    placeholder="Purchase of MD2 seedlings..."
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setTransDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Invested</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(data.totalContributions)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(data.totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(data.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-gold-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cashBalance >= 0 ? "text-gold-400" : "text-red-400"}`}>
              {formatCurrency(cashBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {data.transactions.length > 0 ? (
                <div className="space-y-2">
                  {data.transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${t.type === "revenue" ? "bg-green-400" : "bg-red-400"}`} />
                        <div>
                          <p className="text-sm font-medium">{t.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.description || "No description"} • {formatDate(t.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${t.type === "revenue" ? "text-green-400" : "text-red-400"}`}>
                          {t.type === "revenue" ? "+" : "-"}{formatCurrency(t.amount)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {t.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No transactions yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions">
          <Card>
            <CardHeader>
              <CardTitle>Capital Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              {data.contributions.length > 0 ? (
                <div className="space-y-2">
                  {data.contributions.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <p className="text-sm font-medium">{c.partnerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.notes || "No notes"} • {formatDate(c.date)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(c.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No contributions yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(data.monthlyExpenses).length > 0 || Object.keys(data.monthlyRevenue).length > 0 ? (
                <div className="space-y-4">
                  {Array.from(
                    new Set([
                      ...Object.keys(data.monthlyExpenses),
                      ...Object.keys(data.monthlyRevenue),
                    ])
                  )
                    .sort()
                    .reverse()
                    .map((month) => {
                      const expenses = data.monthlyExpenses[month] || 0
                      const revenue = data.monthlyRevenue[month] || 0
                      const net = revenue - expenses
                      return (
                        <div key={month} className="p-4 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{month}</h4>
                            <span className={`text-sm font-bold ${net >= 0 ? "text-green-400" : "text-red-400"}`}>
                              Net: {formatCurrency(net)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Revenue</p>
                              <p className="text-sm font-medium text-green-400">
                                {formatCurrency(revenue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Expenses</p>
                              <p className="text-sm font-medium text-red-400">
                                {formatCurrency(expenses)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No monthly data yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
