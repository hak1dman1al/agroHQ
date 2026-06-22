import { NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { users } from "@/lib/db/schema"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    const adminUsers = await db
      .select()
      .from(users)
      .where(sql`${users.role} = 'admin'`)
      .limit(1)

    return NextResponse.json({ hasAdmin: adminUsers.length > 0 })
  } catch (error) {
    // If table doesn't exist yet, return false
    return NextResponse.json({ hasAdmin: false })
  }
}
