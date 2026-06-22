import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { presentations, slides } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth/session"
import { getSignedUploadUrl } from "@/lib/storage/minio"

// POST /api/presentations/[id]/export - Export presentation to HTML
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch presentation
    const [presentation] = await db
      .select()
      .from(presentations)
      .where(eq(presentations.id, params.id))
      .limit(1)

    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 })
    }

    // Fetch slides
    const presentationSlides = await db
      .select()
      .from(slides)
      .where(eq(slides.presentationId, params.id))
      .orderBy(asc(slides.orderIndex))

    // Generate HTML export
    const htmlContent = generatePresentationHTML(presentation, presentationSlides)

    // Save to MinIO
    const filename = `${presentation.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-export.html`
    const minioKey = `exports/${params.id}/${filename}`
    
    const { url } = await getSignedUploadUrl(minioKey, "text/html")
    
    // Upload to MinIO
    const uploadResponse = await fetch(url, {
      method: "PUT",
      body: htmlContent,
      headers: {
        "Content-Type": "text/html",
      },
    })

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload export to storage")
    }

    // Return download URL
    const { url: downloadUrl } = await getSignedUploadUrl(minioKey, "text/html")
    
    return NextResponse.json({
      success: true,
      filename,
      downloadUrl: `/api/attachments/download?key=${encodeURIComponent(minioKey)}`,
    })
  } catch (error) {
    console.error("Error exporting presentation:", error)
    return NextResponse.json(
      { error: "Failed to export presentation" },
      { status: 500 }
    )
  }
}

function generatePresentationHTML(presentation: any, slides: any[]): string {
  const slidesHTML = slides.map((slide, index) => {
    return `
      <div class="slide" id="slide-${index + 1}">
        <div class="slide-number">${index + 1} / ${slides.length}</div>
        <div class="slide-content">
          ${slide.title ? `<h1>${escapeHtml(slide.title)}</h1>` : ""}
          ${slide.subtitle ? `<h2>${escapeHtml(slide.subtitle)}</h2>` : ""}
          ${slide.content ? `<div class="slide-body">${slide.content}</div>` : ""}
        </div>
      </div>
    `
  }).join("\n")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(presentation.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
    }
    .slide {
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 4rem;
      page-break-after: always;
      position: relative;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
    }
    .slide-number {
      position: absolute;
      bottom: 2rem;
      right: 2rem;
      font-size: 0.875rem;
      color: #666;
    }
    .slide-content {
      max-width: 1200px;
      width: 100%;
      text-align: center;
    }
    h1 {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #10b981;
    }
    h2 {
      font-size: 2rem;
      font-weight: 400;
      color: #a3a3a3;
      margin-bottom: 2rem;
    }
    .slide-body {
      font-size: 1.25rem;
      line-height: 1.8;
      color: #d4d4d4;
    }
    @media print {
      .slide {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  ${slidesHTML}
</body>
</html>`
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
