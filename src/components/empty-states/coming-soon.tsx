import { Construction } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ComingSoonProps {
  title: string
  description: string
  phase?: string
}

export function ComingSoon({ title, description, phase = "Phase 2+" }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{title}</h2>
              <p className="text-muted-foreground">{description}</p>
              <p className="text-sm text-primary font-medium">
                Coming in {phase}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
