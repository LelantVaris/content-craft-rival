
"use client"

import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import React, { useState, useEffect } from "react"
import { Markdown } from "./markdown"

interface ReasoningProps {
  children: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isStreaming?: boolean
}

interface ReasoningTriggerProps {
  children: React.ReactNode
  className?: string
}

interface ReasoningContentProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  markdown?: boolean
}

const ReasoningContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isStreaming?: boolean
}>({
  isOpen: false,
  setIsOpen: () => {},
  isStreaming: false,
})

export function Reasoning({ 
  children, 
  className, 
  open, 
  onOpenChange, 
  isStreaming 
}: ReasoningProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  useEffect(() => {
    if (isStreaming === false) {
      // Auto-close when streaming stops
      if (isControlled && onOpenChange) {
        onOpenChange(false)
      } else {
        setInternalOpen(false)
      }
    }
  }, [isStreaming, isControlled, onOpenChange])

  const setIsOpen = (newOpen: boolean) => {
    if (isControlled && onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  return (
    <ReasoningContext.Provider value={{ isOpen, setIsOpen, isStreaming }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </ReasoningContext.Provider>
  )
}

export function ReasoningTrigger({ children, className }: ReasoningTriggerProps) {
  const { isOpen, setIsOpen, isStreaming } = React.useContext(ReasoningContext)

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors",
        className
      )}
      disabled={isStreaming}
    >
      {children}
      {isOpen ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )}
    </button>
  )
}

export function ReasoningContent({ 
  children, 
  className, 
  contentClassName,
  markdown = false
}: ReasoningContentProps) {
  const { isOpen } = React.useContext(ReasoningContext)

  if (!isOpen) return null

  return (
    <div className={cn("mt-2 animate-in slide-in-from-top-2", className)}>
      <div className={cn("text-sm", contentClassName)}>
        {markdown && typeof children === 'string' ? (
          <Markdown>{children}</Markdown>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
