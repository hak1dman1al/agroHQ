export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { capitalContributions, financialTransactions, partners, users } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"
import { FinancialPage } from "@/components/financial/financial-page"

async function getFinancialData() {
  try {
    const [contributions, transactions, summary] = await Promise.all([
      // Capital contributions with partner names
      db
        .select({
          id: capitalContributions.id,
          partnerId: capitalContributions.partnerId,
          partnerName: partners.name,
          amount: capitalContributions.amount,
          date: capitalContributions.date,
          notes: capitalContributions.notes,
        })
        .from(capitalContributions)
        .innerJoin(partners, eq(capitalContributions.partnerId, partners.id))
        .orderBy(desc(capitalContributions.date)),

      // Transactions
      db
        .select({
          id: financialTransactions.id,
          type: financialTransactions.type,
          category: financialTransactions.category,
          amount: financialTransactions.amount,
          date: financialTransactions.date,
          description: financialTransactions.description,
        })
        .from(financialTransactions)
        .orderBy(desc(financialTransactions.date)),

      // Summary aggregates
      db
        .select({
          totalContributions: sql<number>`COALESCE(SUM(CASE WHEN true THEN ${capitalContributions.amount} ELSE 0 END), 0)`.mapWith(Number),
          totalExpenses: sql<number>`COALESCE(SUM(CASE WHEN ${financialTransactions.type} = 'expense' THEN ${financialTransactions.amount} ELSE 0 END), 0)`.mapWith(Number),
          totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${financialTransactions.type} = 'revenue' THEN ${financialTransactions.amount} ELSE 0 END), 0)`.mapWith(Number),
        })
        .from(financialTransactions)
        .leftJoin(capitalContributions, sql`true`),
    ])

    // Calculate monthly data for charts
    const monthlyExpenses: Record<string, number> = {}
    const monthlyRevenue: Record<string, number> = {}

    transactions.forEach((t) => {
      const month = new Date(t.date).toISOString().substring(0, 7)
      if (t.type === "expense") {
        monthlyExpenses[month] = (monthlyExpenses[month] || 0) + t.amount
      } else {
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + t.amount
      }
    })

    return {
      contributions,
      transactions,
      totalContributions: contributions.reduce((sum, c) => sum + c.amount, 0),
      totalExpenses: transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
      totalRevenue: transactions
        .filter((t) => t.type === "revenue")
        .reduce((sum, t) => sum + t.amount, 0),
      monthlyExpenses,
      monthlyRevenue,
    }
  } catch (error) {
    console.error("Failed to fetch financial data:", error)
    return {
      contributions: [],
      transactions: [],
      totalContributions: 0,
      totalExpenses: 0,
      totalRevenue: 0,
      monthlyExpenses: {},
      monthlyRevenue: {},
    }
  }
}

async function getPartners() {
  try {
    return await db.select({ id: partners.id, name: partners.name }).from(partners)
  } catch {
    return []
  }
}

export default async function FinancialRoute() {
  const [data, partnerList] = await Promise.all([getFinancialData(), getPartners()])
  return <FinancialPage data={data} partners={partnerList} />
}
