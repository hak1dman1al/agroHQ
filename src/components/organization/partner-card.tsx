import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"
import { Mail, Phone } from "lucide-react"

interface Partner {
  id: string
  name: string
  photoUrl: string | null
  position: string | null
  role: string | null
  responsibilities: string | null
  expertise: string | null
  equityPercentage: number | null
  email: string | null
  phone: string | null
  userRole: string
}

export function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <Card className="border-border/50 hover:border-primary/20 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={partner.photoUrl || ""} alt={partner.name} />
            <AvatarFallback className="text-sm font-medium">
              {getInitials(partner.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {partner.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {partner.position || partner.role || "Partner"}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {partner.userRole}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {partner.responsibilities && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Responsibilities
            </p>
            <p className="text-sm text-foreground">
              {partner.responsibilities}
            </p>
          </div>
        )}

        {partner.expertise && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Expertise
            </p>
            <p className="text-sm text-foreground">{partner.expertise}</p>
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t border-border">
          {partner.equityPercentage !== null && (
            <div className="text-center">
              <p className="text-lg font-bold text-primary">
                {partner.equityPercentage}%
              </p>
              <p className="text-xs text-muted-foreground">Equity</p>
            </div>
          )}
          <div className="flex-1" />
          {partner.email && (
            <a
              href={`mailto:${partner.email}`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
          {partner.phone && (
            <a
              href={`tel:${partner.phone}`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
