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
    const { content, presentationId, currentSlideCount = 0 } = body

    if (!content || !presentationId) {
      return NextResponse.json(
        { error: "Content and presentationId are required" },
        { status: 400 }
      )
    }

    // AI Generation Logic
    // This is a rule-based generator that analyzes content and creates appropriate slides
    // In production, this would call an LLM API (OpenAI, Anthropic, etc.)
    const generatedSlides = generateSlidesFromContent(content, currentSlideCount)

    // Save slides to database
    const savedSlides = []
    for (let i = 0; i < generatedSlides.length; i++) {
      const slide = generatedSlides[i]
      const [saved] = await db
        .insert(slides)
        .values({
          presentationId,
          type: slide.type,
          layout: slide.layout || "center",
          title: slide.title || null,
          subtitle: slide.subtitle || null,
          mainMessage: slide.mainMessage || null,
          contentJson: slide.contentJson || {},
          orderIndex: currentSlideCount + i,
        })
        .returning()

      savedSlides.push(saved)
    }

    return NextResponse.json({ slides: savedSlides })
  } catch (error) {
    console.error("Failed to generate slides:", error)
    return NextResponse.json(
      { error: "Failed to generate slides" },
      { status: 500 }
    )
  }
}

function generateSlidesFromContent(content: string, startIndex: number) {
  const slides: any[] = []
  const lines = content.split("\n").filter((l) => l.trim())
  const lowerContent = content.toLowerCase()

  // Detect numbers/KPIs
  const numberPattern = /(\d+(?:\.\d+)?)\s*(%|k|m|million|billion|rm|\$)/gi
  const numbers = content.match(numberPattern) || []

  // Detect dates/years
  const yearPattern = /\b(20\d{2})\b/g
  const years = [...new Set(content.match(yearPattern) || [])]

  // Detect bullet-like lines
  const bulletLines = lines.filter(
    (l) => l.startsWith("-") || l.startsWith("•") || l.startsWith("*") || /^\d+\./.test(l)
  )

  // Generate cover slide
  slides.push({
    type: "cover",
    layout: "hero",
    title: lines[0] || "Presentation",
    subtitle: lines[1] || "Generated from content",
    mainMessage: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    contentJson: {},
  })

  // Generate KPI slide if numbers detected
  if (numbers.length > 0) {
    const kpis = numbers.slice(0, 4).map((num) => ({
      label: "Metric",
      value: num,
      trend: "",
    }))

    slides.push({
      type: "kpi",
      layout: "grid",
      title: "Key Metrics",
      subtitle: "Performance indicators from content",
      contentJson: { kpis },
    })
  }

  // Generate timeline if years detected
  if (years.length >= 2) {
    const sortedYears = years.sort()
    const items = sortedYears.map((year) => ({
      year,
      title: `Phase ${year}`,
      description: "Milestone",
    }))

    slides.push({
      type: "timeline",
      layout: "horizontal",
      title: "Timeline",
      contentJson: { items },
    })
  }

  // Generate bullet slide if bullet points detected
  if (bulletLines.length >= 2) {
    const bullets = bulletLines
      .map((l) => l.replace(/^[-•*\d.]+\s*/, "").trim())
      .filter((l) => l.length > 0)
      .slice(0, 6)

    slides.push({
      type: "bullet",
      layout: "center",
      title: "Key Points",
      contentJson: { bullets },
    })
  }

  // Generate text slides from remaining content
  const remainingLines = lines.filter(
    (l) =>
      !bulletLines.includes(l) &&
      l !== lines[0] &&
      l !== lines[1] &&
      l.trim().length > 20
  )

  for (let i = 0; i < Math.min(remainingLines.length, 3); i++) {
    slides.push({
      type: "text",
      layout: "center",
      title: `Section ${i + 1}`,
      mainMessage: remainingLines[i],
      contentJson: {},
    })
  }

  // Generate action plan if action words detected
  const actionWords = ["todo", "action", "task", "plan", "next", "deadline", "responsible"]
  const hasActions = actionWords.some((w) => lowerContent.includes(w))

  if (hasActions) {
    const actionLines = lines
      .filter((l) => actionWords.some((w) => l.toLowerCase().includes(w)))
      .slice(0, 4)
      .map((l) => ({
        task: l.replace(/^[-•*\d.]+\s*/, "").trim(),
        assignee: "TBD",
        due: "TBD",
      }))

    if (actionLines.length > 0) {
      slides.push({
        type: "action_plan",
        layout: "center",
        title: "Action Plan",
        contentJson: { actions: actionLines },
      })
    }
  }

  // Always end with thank you
  slides.push({
    type: "thank_you",
    layout: "hero",
    title: "Thank You",
    subtitle: "Questions & Discussion",
    contentJson: {},
  })

  return slides
}
