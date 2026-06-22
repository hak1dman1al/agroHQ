import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { slides } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { templateId, presentationId } = body

    if (!templateId || !presentationId) {
      return NextResponse.json(
        { error: "Template ID and presentation ID are required" },
        { status: 400 }
      )
    }

    const templateSlides = getTemplateSlides(templateId)
    if (templateSlides.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    // Insert all template slides
    const savedSlides = []
    for (let i = 0; i < templateSlides.length; i++) {
      const slide = templateSlides[i]
      const [saved] = await db
        .insert(slides)
        .values({
          presentationId,
          type: slide.type,
          layout: slide.layout,
          title: slide.title,
          subtitle: slide.subtitle,
          mainMessage: slide.mainMessage,
          contentJson: slide.contentJson,
          orderIndex: i,
        })
        .returning()

      savedSlides.push(saved)
    }

    return NextResponse.json({ slides: savedSlides })
  } catch (error) {
    console.error("Failed to generate from template:", error)
    return NextResponse.json(
      { error: "Failed to generate from template" },
      { status: 500 }
    )
  }
}

function getTemplateSlides(templateId: string) {
  const templates: Record<string, any[]> = {
    "monthly-update": [
      {
        type: "cover",
        layout: "hero",
        title: "Monthly Update",
        subtitle: "Progress Report",
        mainMessage: "Your Company Name",
        contentJson: {},
      },
      {
        type: "section",
        layout: "center",
        title: "Executive Summary",
        subtitle: "Key highlights from this month",
        contentJson: {},
      },
      {
        type: "kpi",
        layout: "grid",
        title: "Key Metrics",
        subtitle: "Performance indicators",
        contentJson: {
          kpis: [
            { label: "Revenue", value: "$0", trend: "+0%" },
            { label: "Active Users", value: "0", trend: "+0" },
            { label: "Tasks Done", value: "0", trend: "+0" },
          ],
        },
      },
      {
        type: "bullet",
        layout: "center",
        title: "Key Achievements",
        contentJson: {
          bullets: [
            "Achievement one - click to edit",
            "Achievement two - click to edit",
            "Achievement three - click to edit",
          ],
        },
      },
      {
        type: "section",
        layout: "center",
        title: "Financial Overview",
        contentJson: {},
      },
      {
        type: "financial",
        layout: "center",
        title: "Financial Snapshot",
        contentJson: {
          capital: "$0",
          revenue: "$0",
          expenses: "$0",
          cash: "$0",
        },
      },
      {
        type: "action_plan",
        layout: "center",
        title: "Next Steps",
        contentJson: {
          actions: [
            { task: "Action item one", assignee: "TBD", due: "TBD" },
            { task: "Action item two", assignee: "TBD", due: "TBD" },
          ],
        },
      },
      {
        type: "thank_you",
        layout: "hero",
        title: "Thank You",
        subtitle: "Questions & Discussion",
        contentJson: {},
      },
    ],
    "investor-pitch": [
      {
        type: "cover",
        layout: "hero",
        title: "Company Name",
        subtitle: "Investor Pitch",
        mainMessage: "Series A",
        contentJson: {},
      },
      {
        type: "section",
        layout: "center",
        title: "The Problem",
        contentJson: {},
      },
      {
        type: "text",
        layout: "center",
        title: "Problem Statement",
        mainMessage: "Describe the problem you're solving. Make it relatable and urgent.",
        contentJson: {},
      },
      {
        type: "section",
        layout: "center",
        title: "Our Solution",
        contentJson: {},
      },
      {
        type: "bullet",
        layout: "center",
        title: "How We Solve It",
        contentJson: {
          bullets: [
            "Key feature one - edit me",
            "Key feature two - edit me",
            "Key feature three - edit me",
            "Key feature four - edit me",
          ],
        },
      },
      {
        type: "kpi",
        layout: "grid",
        title: "Traction",
        contentJson: {
          kpis: [
            { label: "Users", value: "0", trend: "+0%" },
            { label: "Revenue", value: "$0", trend: "+0%" },
            { label: "Growth", value: "0%", trend: "" },
          ],
        },
      },
      {
        type: "section",
        layout: "center",
        title: "Market Opportunity",
        contentJson: {},
      },
      {
        type: "text",
        layout: "center",
        title: "Market Size",
        mainMessage: "TAM: $XB | SAM: $XB | SOM: $XB",
        contentJson: {},
      },
      {
        type: "organization",
        layout: "center",
        title: "Our Team",
        contentJson: {
          members: [
            { name: "CEO Name", role: "CEO & Co-Founder", avatar: "CN" },
            { name: "CTO Name", role: "CTO & Co-Founder", avatar: "CN" },
          ],
        },
      },
      {
        type: "financial",
        layout: "center",
        title: "Financial Projections",
        contentJson: {
          y1: "$0",
          y2: "$0",
          y3: "$0",
        },
      },
      {
        type: "text",
        layout: "center",
        title: "The Ask",
        mainMessage: "Raising $XM Series A to accelerate growth",
        contentJson: {},
      },
      {
        type: "thank_you",
        layout: "hero",
        title: "Thank You",
        subtitle: "Let's Talk",
        contentJson: {},
      },
    ],
    "quarterly-review": [
      {
        type: "cover",
        layout: "hero",
        title: "Quarterly Review",
        subtitle: "Q[X] 20XX",
        mainMessage: "Company Name",
        contentJson: {},
      },
      {
        type: "section",
        layout: "center",
        title: "Executive Summary",
        contentJson: {},
      },
      {
        type: "kpi",
        layout: "grid",
        title: "Quarter Highlights",
        contentJson: {
          kpis: [
            { label: "Revenue", value: "$0", trend: "+0%" },
            { label: "Customers", value: "0", trend: "+0" },
            { label: "Team Size", value: "0", trend: "" },
          ],
        },
      },
      {
        type: "section",
        layout: "center",
        title: "Performance",
        contentJson: {},
      },
      {
        type: "bullet",
        layout: "center",
        title: "Key Wins",
        contentJson: {
          bullets: [
            "Win one - edit me",
            "Win two - edit me",
            "Win three - edit me",
          ],
        },
      },
      {
        type: "bullet",
        layout: "center",
        title: "Challenges Faced",
        contentJson: {
          bullets: [
            "Challenge one - edit me",
            "Challenge two - edit me",
          ],
        },
      },
      {
        type: "section",
        layout: "center",
        title: "Financials",
        contentJson: {},
      },
      {
        type: "financial",
        layout: "center",
        title: "Financial Summary",
        contentJson: {
          revenue: "$0",
          expenses: "$0",
          profit: "$0",
        },
      },
      {
        type: "section",
        layout: "center",
        title: "Looking Ahead",
        contentJson: {},
      },
      {
        type: "action_plan",
        layout: "center",
        title: "Q[X+1] Priorities",
        contentJson: {
          actions: [
            { task: "Priority one", assignee: "TBD", due: "TBD" },
            { task: "Priority two", assignee: "TBD", due: "TBD" },
          ],
        },
      },
      {
        type: "thank_you",
        layout: "hero",
        title: "Thank You",
        subtitle: "Questions?",
        contentJson: {},
      },
    ],
    "strategy-deck": [
      {
        type: "cover",
        layout: "hero",
        title: "Strategy 20XX-20XX",
        subtitle: "Our Path Forward",
        mainMessage: "Company Name",
        contentJson: {},
      },
      {
        type: "section",
        layout: "center",
        title: "Where We Are",
        contentJson: {},
      },
      {
        type: "text",
        layout: "center",
        title: "Current State",
        mainMessage: "Where are we today?",
        contentJson: {},
      },
      {
        type: "section",
        layout: "center",
        title: "Where We're Going",
        contentJson: {},
      },
      {
        type: "text",
        layout: "center",
        title: "Our Vision",
        mainMessage: "Where do we want to be?",
        contentJson: {},
      },
      {
        type: "section",
        layout: "center",
        title: "How We'll Get There",
        contentJson: {},
      },
      {
        type: "bullet",
        layout: "center",
        title: "Strategic Pillars",
        contentJson: {
          bullets: [
            "Pillar 1 - edit me",
            "Pillar 2 - edit me",
            "Pillar 3 - edit me",
          ],
        },
      },
      {
        type: "timeline",
        layout: "horizontal",
        title: "Roadmap",
        contentJson: {
          items: [
            { year: "20XX", title: "Phase 1", description: "Foundation" },
            { year: "20XX", title: "Phase 2", description: "Growth" },
            { year: "20XX", title: "Phase 3", description: "Scale" },
          ],
        },
      },
      {
        type: "action_plan",
        layout: "center",
        title: "Immediate Actions",
        contentJson: {
          actions: [
            { task: "Action 1", assignee: "TBD", due: "TBD" },
            { task: "Action 2", assignee: "TBD", due: "TBD" },
          ],
        },
      },
      {
        type: "thank_you",
        layout: "hero",
        title: "Thank You",
        subtitle: "Let's Build Together",
        contentJson: {},
      },
    ],
    "board-meeting": [
      {
        type: "cover",
        layout: "hero",
        title: "Board Meeting",
        subtitle: "Q[X] 20XX",
        mainMessage: "Company Name",
        contentJson: {},
      },
      {
        type: "section",
        layout: "center",
        title: "Agenda",
        contentJson: {},
      },
      {
        type: "bullet",
        layout: "center",
        title: "Today's Topics",
        contentJson: {
          bullets: [
            "Financial review",
            "Strategic updates",
            "Key decisions",
            "Q&A",
          ],
        },
      },
      {
        type: "kpi",
        layout: "grid",
        title: "Key Metrics",
        contentJson: {
          kpis: [
            { label: "Revenue", value: "$0", trend: "" },
            { label: "Burn Rate", value: "$0/mo", trend: "" },
            { label: "Runway", value: "0 mo", trend: "" },
          ],
        },
      },
      {
        type: "financial",
        layout: "center",
        title: "Financial Position",
        contentJson: {
          cash: "$0",
          revenue: "$0",
          expenses: "$0",
        },
      },
      {
        type: "decision",
        layout: "center",
        title: "Decisions Required",
        contentJson: {
          decisions: [
            "Decision 1 - edit me",
            "Decision 2 - edit me",
          ],
        },
      },
      {
        type: "action_plan",
        layout: "center",
        title: "Action Items",
        contentJson: {
          actions: [
            { task: "Action 1", assignee: "TBD", due: "TBD" },
          ],
        },
      },
      {
        type: "thank_you",
        layout: "hero",
        title: "Thank You",
        subtitle: "Questions & Discussion",
        contentJson: {},
      },
    ],
    "blank": [
      {
        type: "cover",
        layout: "hero",
        title: "New Presentation",
        subtitle: "Click to edit",
        contentJson: {},
      },
    ],
  }

  return templates[templateId] || []
}
