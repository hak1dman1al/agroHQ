"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SlideRenderer } from "@/components/presentations/slide-renderer"
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize,
} from "lucide-react"

interface Slide {
  id: string
  presentationId: string
  type: string
  layout: string
  title: string | null
  subtitle: string | null
  mainMessage: string | null
  contentJson: any
  orderIndex: number
}

interface Presentation {
  id: string
  title: string
  theme: string
  slides: Slide[]
}

export function PresentationViewer({ presentation }: { presentation: Presentation }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const router = useRouter()

  const currentSlide = presentation.slides[currentSlideIndex]
  const totalSlides = presentation.slides.length

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        nextSlide()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        prevSlide()
      } else if (e.key === "Escape") {
        if (isFullscreen) {
          document.exitFullscreen()
        } else {
          router.push("/presentations")
        }
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [currentSlideIndex, isFullscreen])

  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (!currentSlide) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No slides in this presentation</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/presentations")}>
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-sm font-medium">{presentation.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {currentSlideIndex + 1} / {totalSlides}
          </span>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl aspect-video shadow-2xl rounded-lg overflow-hidden">
          <SlideRenderer slide={currentSlide} theme={presentation.theme} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 pb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-1">
          {presentation.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlideIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlideIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          disabled={currentSlideIndex === totalSlides - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
