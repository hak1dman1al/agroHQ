"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import {
  Presentation,
  Plus,
  Layers,
  Eye,
  Edit3,
  Lock,
  Globe,
} from "lucide-react"
import Link from "next/link"

interface PresItem {
  id: string
  title: string
  theme: string
  isPublic: boolean
  shareToken: string | null
  createdBy: string
  creatorName: string
  createdAt: Date
  updatedAt: Date
  slideCount: number
}

const themes = [
  { value: "executive", label: "Executive", color: "bg-forest-800" },
  { value: "modern", label: "Modern", color: "bg-blue-800" },
  { value: "minimal", label: "Minimal", color: "bg-gray-800" },
  { value: "bold", label: "Bold", color: "bg-gold-700" },
]

export function PresentationsPage({ presentations }: { presentations: PresItem[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Presentations</h2>
          <p className="text-muted-foreground">
            Create and manage presentations for meetings and investors
          </p>
        </div>
        <Button asChild>
          <Link href="/presentations/new">
            <Plus className="mr-2 h-4 w-4" />
            New Presentation
          </Link>
        </Button>
      </div>

      {presentations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presentations.map((pres) => {
            const themeConfig = themes.find((t) => t.value === pres.theme) || themes[0]
            return (
              <Card key={pres.id} className="border-border/50 hover:border-primary/20 transition-colors group">
                <CardHeader className="pb-0">
                  <div className={`aspect-video rounded-t-lg ${themeConfig.color} flex items-center justify-center`}>
                    <Presentation className="h-12 w-12 text-white/50" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-foreground truncate">{pres.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Layers className="mr-1 h-3 w-3" />
                      {pres.slideCount} slides
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {pres.isPublic ? (
                        <><Globe className="mr-1 h-3 w-3" /> Public</>
                      ) : (
                        <><Lock className="mr-1 h-3 w-3" /> Private</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {pres.creatorName} • Updated {formatDate(pres.updatedAt)}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/presentations/${pres.id}/edit`}>
                        <Edit3 className="mr-1 h-3 w-3" />
                        Edit
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/presentations/${pres.id}/present`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Presentation className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No presentations yet. Create your first one.
            </p>
            <Button asChild>
              <Link href="/presentations/new">
                <Plus className="mr-2 h-4 w-4" />
                Create First Presentation
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
