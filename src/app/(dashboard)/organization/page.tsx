export const dynamic = "force-dynamic"

import { db } from "@/lib/db/client"
import { partners, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { PartnerCard } from "@/components/organization/partner-card"
import { InvitePartnerDialog } from "@/components/organization/invite-dialog"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

async function getPartners() {
  try {
    const partnerList = await db
      .select({
        id: partners.id,
        name: partners.name,
        photoUrl: partners.photoUrl,
        position: partners.position,
        role: partners.role,
        responsibilities: partners.responsibilities,
        expertise: partners.expertise,
        equityPercentage: partners.equityPercentage,
        joiningDate: partners.joiningDate,
        email: partners.email,
        phone: partners.phone,
        userRole: users.role,
      })
      .from(partners)
      .innerJoin(users, eq(partners.userId, users.id))

    return partnerList
  } catch {
    return []
  }
}

export default async function OrganizationPage() {
  const partnerList = await getPartners()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organization</h2>
          <p className="text-muted-foreground">
            Manage your team and shareholder profiles
          </p>
        </div>
        <InvitePartnerDialog />
      </div>

      {partnerList.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {partnerList.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No partners yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by inviting your founding shareholders
          </p>
          <InvitePartnerDialog />
        </div>
      )}
    </div>
  )
}
