
"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ResponseStreamProps {
  textStream: string
  mode?: "fade" | "typewriter"
  className?: string
  fadeDuration?: number
  segmentDelay?: number
}

export function ResponseStream({
  textStream,
  mode = "typewriter",
  className,
  fadeDuration = 800,
  segmentDelay = 50,
}: ResponseStreamProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!textStream) {
      setDisplayedText("")
      setCurrentIndex(0)
      return
    }

    if (currentIndex < textStream.length) {
      const timer = setTimeout(() => {
        setDisplayedText(textStream.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, segmentDelay)

      return () => clearTimeout(timer)
    }
  }, [textStream, currentIndex, segmentDelay])

  useEffect(() => {
    setCurrentIndex(0)
    setDisplayedText("")
  }, [textStream])

  if (mode === "fade") {
    const words = textStream.split(" ")
    const displayedWords = displayedText.split(" ")

    return (
      <div className={cn("whitespace-pre-wrap", className)}>
        {words.map((word, index) => (
          <span
            key={index}
            className={cn(
              "transition-opacity duration-300",
              index < displayedWords.length ? "opacity-100" : "opacity-0"
            )}
            style={{
              transitionDuration: `${fadeDuration}ms`,
            }}
          >
            {word}{index < words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {displayedText}
      {currentIndex < textStream.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  )
}
