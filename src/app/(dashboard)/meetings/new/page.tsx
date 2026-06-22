"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Target,
  CheckSquare,
  Sparkles,
  Zap,
  BookOpen,
  Briefcase,
  TrendingUp,
  Lightbulb,
} from "lucide-react"
import Link from "next/link"

interface Partner {
  id: string
  name: string
  email: string | null
}

const meetingTemplates = [
  {
    id: "weekly-standup",
    name: "Weekly Standup",
    description: "Quick sync on progress, blockers, and plans",
    icon: Clock,
    duration: "30 minutes",
    agenda: `1. Quick wins from last week
2. Current sprint progress
3. Blockers and challenges
4. Next week priorities
5. Action items`,
    actionItems: [
      "Follow up with [name] on [topic]",
      "Review [document/task] by [date]",
    ],
  },
  {
    id: "monthly-review",
    name: "Monthly Review",
    description: "Comprehensive monthly performance and strategy review",
    icon: TrendingUp,
    duration: "90 minutes",
    agenda: `1. Financial performance review
2. Key metrics and KPIs
3. Operational highlights
4. Challenges and learnings
5. Strategic initiatives update
6. Next month priorities
7. Resource allocation
8. Action items`,
    actionItems: [
      "Prepare financial report for [date]",
      "Schedule 1-on-1s with team leads",
      "Review and update roadmap",
    ],
  },
  {
    id: "board-meeting",
    name: "Board Meeting",
    description: "Formal board meeting with stakeholders",
    icon: Briefcase,
    duration: "120 minutes",
    agenda: `1. Welcome and approvals
2. CEO report
3. Financial performance
4. Strategic initiatives
5. Risk management
6. Governance matters
7. Q&A session
8. Next meeting schedule`,
    actionItems: [
      "Circulate board pack 7 days prior",
      "Confirm attendance",
      "Prepare minutes template",
    ],
  },
  {
    id: "brainstorming",
    name: "Brainstorming Session",
    description: "Creative problem-solving and ideation",
    icon: Lightbulb,
    duration: "60 minutes",
    agenda: `1. Problem statement
2. Context and constraints
3. Ideation (no judgment)
4. Grouping and prioritization
5. Next steps and ownership
6. Action items`,
    actionItems: [
      "Document top 3 ideas",
      "Assign research tasks",
      "Schedule follow-up meeting",
    ],
  },
  {
    id: "project-kickoff",
    name: "Project Kickoff",
    description: "Launch a new project or initiative",
    icon: Zap,
    duration: "60 minutes",
    agenda: `1. Project vision and goals
2. Scope and deliverables
3. Timeline and milestones
4. Team roles and responsibilities
5. Communication plan
6. Risk assessment
7. Q&A
8. Next steps`,
    actionItems: [
      "Share project charter",
      "Set up project workspace",
      "Schedule first sprint planning",
    ],
  },
  {
    id: "custom",
    name: "Custom Meeting",
    description: "Start with a blank template",
    icon: FileText,
    duration: "Custom",
    agenda: "",
    actionItems: [],
  },
]

export function NewMeetingPage({ partners }: { partners: Partner[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom")
  const [title, setTitle] = useState("")
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [duration, setDuration] = useState("60")
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])
  const [agenda, setAgenda] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")

  const currentTemplate = meetingTemplates.find(t => t.id === selectedTemplate)

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = meetingTemplates.find(t => t.id === templateId)
    if (template) {
      setTitle(template.name)
      setAgenda(template.agenda)
      setDuration(template.duration.replace(" minutes", "").replace("Custom", "60"))
    }
  }

  const toggleAttendee = (partnerId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(partnerId)
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    )
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !meetingDate) {
      toast({
        title: "Missing required fields",
        description: "Please provide a title and date",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date: `${meetingDate}T${meetingTime || "09:00"}:00`,
          duration: parseInt(duration),
          attendees: selectedAttendees,
          agenda,
          location,
          notes,
          templateId: selectedTemplate,
        }),
      })

      if (!res.ok) throw new Error("Failed to create meeting")

      const meeting = await res.json()
      toast({
        title: "Meeting created",
        description: "Redirecting to meeting details...",
      })
      router.push(`/meetings/${meeting.id}`)
    } catch (error) {
      toast({
        title: "Failed to create meeting",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Meeting</h1>
        <p className="text-muted-foreground">
          Create a new meeting with templates, attendees, and agenda
        </p>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Choose a Template</CardTitle>
          <CardDescription>
            Select a meeting template or start custom
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {meetingTemplates.map((template) => {
              const Icon = template.icon
              const isSelected = selectedTemplate === template.id
              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {template.duration}
                      </Badge>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Meeting Details Form */}
      <form onSubmit={handleCreate}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meeting Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Weekly Team Standup"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / Link</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Zoom, Conference Room A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attendees</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {partners.map((partner) => {
                  const isSelected = selectedAttendees.includes(partner.id)
                  return (
                    <button
                      key={partner.id}
                      type="button"
                      onClick={() => toggleAttendee(partner.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                        {partner.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{partner.name}</p>
                        {partner.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {partner.email}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
              {partners.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No partners available. Add partners in the Organization section first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="agenda">Agenda</Label>
              <Textarea
                id="agenda"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="Meeting agenda items..."
                rows={8}
                className="font-mono text-sm"
              />
              {currentTemplate && currentTemplate.actionItems.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-2">Suggested action items:</p>
                  <div className="space-y-1">
                    {currentTemplate.actionItems.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional context or preparation notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Meeting
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/meetings">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
