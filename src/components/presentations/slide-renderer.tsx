import { cn } from "@/lib/utils"
import {
  Leaf,
  Target,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  Map,
  Quote,
} from "lucide-react"

interface Slide {
  id: string
  type: string
  layout: string
  title: string | null
  subtitle: string | null
  mainMessage: string | null
  contentJson: any
}

interface SlideRendererProps {
  slide: Slide
  theme: string
}

const themeStyles: Record<string, string> = {
  executive: "bg-gradient-to-br from-forest-900 to-forest-950 text-white",
  modern: "bg-gradient-to-br from-blue-900 to-blue-950 text-white",
  minimal: "bg-gradient-to-br from-gray-900 to-gray-950 text-white",
  bold: "bg-gradient-to-br from-gold-800 to-gold-900 text-white",
}

export function SlideRenderer({ slide, theme }: SlideRendererProps) {
  const themeClass = themeStyles[theme] || themeStyles.executive
  const content = slide.contentJson || {}

  switch (slide.type) {
    case "cover":
      return <CoverSlide slide={slide} themeClass={themeClass} />
    case "section":
      return <SectionSlide slide={slide} themeClass={themeClass} />
    case "text":
      return <TextSlide slide={slide} themeClass={themeClass} />
    case "bullet":
      return <BulletSlide slide={slide} themeClass={themeClass} />
    case "kpi":
      return <KpiSlide slide={slide} themeClass={themeClass} />
    case "timeline":
      return <TimelineSlide slide={slide} themeClass={themeClass} />
    case "roadmap":
      return <RoadmapSlide slide={slide} themeClass={themeClass} />
    case "organization":
      return <OrgSlide slide={slide} themeClass={themeClass} />
    case "quote":
      return <QuoteSlide slide={slide} themeClass={themeClass} />
    case "thank_you":
      return <ThankYouSlide slide={slide} themeClass={themeClass} />
    case "financial":
      return <FinancialSlide slide={slide} themeClass={themeClass} />
    case "action_plan":
      return <ActionPlanSlide slide={slide} themeClass={themeClass} />
    case "decision":
      return <DecisionSlide slide={slide} themeClass={themeClass} />
    case "risk":
      return <RiskSlide slide={slide} themeClass={themeClass} />
    case "meeting_summary":
      return <MeetingSummarySlide slide={slide} themeClass={themeClass} />
    default:
      return <DefaultSlide slide={slide} themeClass={themeClass} />
  }
}

function CoverSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  return (
    <div className={cn("h-full flex flex-col items-center justify-center p-12", themeClass)}>
      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
        <Leaf className="w-8 h-8 text-gold-400" />
      </div>
      <h1 className="text-4xl font-bold text-center mb-3">{slide.title || "Presentation Title"}</h1>
      <p className="text-lg text-white/70 text-center">{slide.subtitle || "Subtitle"}</p>
      {slide.mainMessage && (
        <p className="text-sm text-white/50 mt-8">{slide.mainMessage}</p>
      )}
    </div>
  )
}

function SectionSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  return (
    <div className={cn("h-full flex items-center justify-center p-12", themeClass)}>
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">{slide.title || "Section"}</h2>
        {slide.subtitle && <p className="text-white/70">{slide.subtitle}</p>}
      </div>
    </div>
  )
}

function TextSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  return (
    <div className={cn("h-full flex flex-col justify-center p-12", themeClass)}>
      <h2 className="text-2xl font-bold mb-4">{slide.title || "Title"}</h2>
      <p className="text-white/80 leading-relaxed">{slide.mainMessage || slide.subtitle || "Content"}</p>
    </div>
  )
}

function BulletSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  const bullets = slide.contentJson?.bullets || ["Point 1", "Point 2", "Point 3"]
  return (
    <div className={cn("h-full flex flex-col justify-center p-12", themeClass)}>
      <h2 className="text-2xl font-bold mb-6">{slide.title || "Key Points"}</h2>
      <ul className="space-y-3">
        {bullets.map((bullet: string, i: number) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-gold-400 mt-0.5 shrink-0" />
            <span className="text-white/80">{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function KpiSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  const kpis = slide.contentJson?.kpis || [
    { label: "Revenue", value: "RM 1.2M", trend: "+15%" },
    { label: "Tasks", value: "47", trend: "+8" },
    { label: "Partners", value: "5", trend: "" },
  ]
  return (
    <div className={cn("h-full flex flex-col justify-center p-12", themeClass)}>
      <h2 className="text-2xl font-bold mb-8">{slide.title || "Key Performance Indicators"}</h2>
      <div className="grid grid-cols-3 gap-6">
        {kpis.map((kpi: any, i: number) => (
          <div key={i} className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gold-400">{kpi.value}</p>
            <p className="text-sm text-white/70 mt-1">{kpi.label}</p>
            {kpi.trend && <p className="text-xs text-green-400 mt-1">{kpi.trend}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function TimelineSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  const items = slide.contentJson?.items || [
    { year: "2026", title: "Startup", description: "Foundation" },
    { year: "2027", title: "Growth", description: "Scale" },
  ]
  return (
    <div className={cn("h-full flex flex-col justify-center p-12", themeClass)}>
      <h2 className="text-2xl font-bold mb-8">{slide.title || "Timeline"}</h2>
      <div className="flex items-center justify-between">
        {items.map((item: any, i: number) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gold-400 flex items-center justify-center text-forest-900 font-bold text-xs">
              {item.year}
            </div>
            <p className="text-sm font-medium mt-2">{item.title}</p>
            <p className="text-xs text-white/60">{item.description}</p>
            {i < items.length - 1 && (
              <div className="absolute top-6 left-[calc(50%+24px)] w-[calc(100%-48px)] h-0.5 bg-white/20" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function RoadmapSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  const phases = slide.contentJson?.phases || [
    { title: "Phase 1", progress: 75, status: "In Progress" },
    { title: "Phase 2", progress: 30, status: "Planned" },
  ]
  return (
    <div className={cn("h-full flex flex-col justify-center p-12", themeClass)}>
      <h2 className="text-2xl font-bold mb-8">{slide.title || "Roadmap"}</h2>
      <div className="space-y-4">
        {phases.map((phase: any, i: number) => (
          <div key={i} className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{phase.title}</span>
              <span className="text-xs text-white/60">{phase.status}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-gold-400 h-2 rounded-full transition-all"
                style={{ width: `${phase.progress}%` }}
              />
            </div>
            <p className="text-xs text-white/60 mt-1">{phase.progress}% complete</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrgSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  const members = slide.contentJson?.members || [
    { name: "John Doe", role: "CEO", avatar: "JD" },
    { name: "Jane Smith", role: "COO", avatar: "JS" },
  ]
  return (
    <div className={cn("h-full flex flex-col justify-center p-12", themeClass)}>
      <h2 className="text-2xl font-bold mb-8">{slide.title || "Our Team"}</h2>
      <div className="grid grid-cols-3 gap-6">
        {members.map((member: any, i: number) => (
          <div key={i} className="bg-white/10 rounded-lg p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gold-400/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-gold-400">{member.avatar}</span>
            </div>
            <p className="font-medium">{member.name}</p>
            <p className="text-xs text-white/60">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuoteSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  return (
    <div className={cn("h-full flex items-center justify-center p-12", themeClass)}>
      <div className="text-center max-w-2xl">
        <Quote className="w-12 h-12 text-gold-400/50 mx-auto mb-6" />
        <p className="text-2xl font-medium italic text-white/90 mb-4">
          {slide.mainMessage || "Your quote here"}
        </p>
        <p className="text-sm text-white/60">— {slide.subtitle || "Author"}</p>
      </div>
    </div>
  )
}

function ThankYouSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  return (
    <div className={cn("h-full flex flex-col items-center justify-center p-12", themeClass)}>
      <h1 className="text-5xl font-bold mb-4">{slide.title || "Thank You"}</h1>
      <p className="text-lg text-white/70">{slide.subtitle || "Questions?"}</p>
      <div className="mt-8 flex items-center gap-2">
        <Leaf className="w-5 h-5 text-gold-400" />
        <span className="text-sm text-white/60">Agro HQ</span>
      </div>
    </div>
  )
}

function FinancialSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  const data = slide.contentJson || {
    revenue: "RM 500K",
    expenses: "RM 300K",
    profit: "RM 200K",
    capital: "RM 2M",
  }
  return (
    <div className={cn("h-full flex flex-col justify-center p-12", themeClass)}>
      <h2 className="text-2xl font-bold mb-8">{slide.title || "Financial Overview"}</h2>
      <div className="grid grid-cols-2 gap-6">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="bg-white/10 rounded-lg p-4">
            <p className="text-xs text-white/60 uppercase">{key}</p>
            <p className="text-2xl font-bold text-gold-400 mt-1">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActionPlanSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  const actions = slide.contentJson?.actions || [
    { task: "Complete land survey", assignee: "John", due: "Jul 2026" },
    { task: "Secure funding", assignee: "Jane", due: "Aug 2026" },
  ]
  return (
    <div className={cn("h-full flex flex-col justify-center p-12", themeClass)}>
      <h2 className="text-2xl font-bold mb-8">{slide.title || "Action Plan"}</h2>
      <div className="space-y-3">
        {actions.map((action: any, i: number) => (
          <div key={i} className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{action.task}</p>
              <p className="text-xs text-white/60">{action.assignee}</p>
            </div>
            <span className="text-xs text-gold-400">{action.due}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DecisionSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  const decisions = slide.contentJson?.decisions || ["Decision 1", "Decision 2"]
  return (
    <div className={cn("h-full flex flex-col justify-center p-12", themeClass)}>
      <h2 className="text-2xl font-bold mb-8">{slide.title || "Key Decisions"}</h2>
      <div className="space-y-3">
        {decisions.map((decision: string, i: number) => (
          <div key={i} className="bg-white/10 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
            <span className="text-white/90">{decision}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RiskSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  const risks = slide.contentJson?.risks || [
    { risk: "Weather impact", level: "High", mitigation: "Diversify crops" },
  ]
  return (
    <div className={cn("h-full flex flex-col justify-center p-12", themeClass)}>
      <h2 className="text-2xl font-bold mb-8">{slide.title || "Risk Assessment"}</h2>
      <div className="space-y-3">
        {risks.map((risk: any, i: number) => (
          <div key={i} className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{risk.risk}</span>
              <Badge className={cn(
                "text-xs",
                risk.level === "High" ? "bg-red-500/20 text-red-400" :
                risk.level === "Medium" ? "bg-gold-500/20 text-gold-400" :
                "bg-green-500/20 text-green-400"
              )}>
                {risk.level}
              </Badge>
            </div>
            <p className="text-xs text-white/60">Mitigation: {risk.mitigation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MeetingSummarySlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  const data = slide.contentJson || {
    date: "June 2026",
    attendees: 5,
    decisions: 3,
    actions: 4,
  }
  return (
    <div className={cn("h-full flex flex-col justify-center p-12", themeClass)}>
      <h2 className="text-2xl font-bold mb-8">{slide.title || "Meeting Summary"}</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/10 rounded-lg p-4">
          <Calendar className="h-8 w-8 text-gold-400 mb-2" />
          <p className="text-sm text-white/60">Date</p>
          <p className="font-medium">{data.date}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <Users className="h-8 w-8 text-gold-400 mb-2" />
          <p className="text-sm text-white/60">Attendees</p>
          <p className="font-medium">{data.attendees}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <CheckCircle2 className="h-8 w-8 text-green-400 mb-2" />
          <p className="text-sm text-white/60">Decisions</p>
          <p className="font-medium">{data.decisions}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <Target className="h-8 w-8 text-gold-400 mb-2" />
          <p className="text-sm text-white/60">Action Items</p>
          <p className="font-medium">{data.actions}</p>
        </div>
      </div>
    </div>
  )
}

function DefaultSlide({ slide, themeClass }: { slide: Slide; themeClass: string }) {
  return (
    <div className={cn("h-full flex flex-col items-center justify-center p-12", themeClass)}>
      <h2 className="text-2xl font-bold mb-2">{slide.title || "Slide"}</h2>
      {slide.subtitle && <p className="text-white/70">{slide.subtitle}</p>}
      {slide.mainMessage && <p className="text-white/60 mt-4">{slide.mainMessage}</p>}
    </div>
  )
}
