"use client"

import { useState, useEffect } from "react"
import { SlideRenderer } from "@/components/presentations/slide-renderer"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react"
import { cn } from "@/lib/utils"

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

export function PublicPresentationViewer({ presentation }: { presentation: Presentation }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  const currentSlide = presentation.slides[currentSlideIndex]
  const totalSlides = presentation.slides.length

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        nextSlide()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        prevSlide()
      } else if (e.key === "Escape" && isFullscreen) {
        exitFullscreen()
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentSlideIndex, isFullscreen])

  const nextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!currentSlide) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No slides available</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/95 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold">{presentation.title}</h1>
          <p className="text-xs text-muted-foreground">Public Presentation</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {currentSlideIndex + 1} / {totalSlides}
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            {formatTime(elapsedTime)}
          </div>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        <div className="w-full max-w-6xl aspect-video shadow-2xl rounded-lg overflow-hidden">
          <SlideRenderer slide={currentSlide} theme={presentation.theme} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 pb-6">
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
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentSlideIndex ? "bg-primary" : "bg-muted"
              )}
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
