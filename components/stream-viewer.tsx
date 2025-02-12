'use client'
import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { useJetstreamContext } from '@/app/context/JetstreamContext'

export default function StreamViewer() {
  const { messages } = useJetstreamContext()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const userScrollRef = useRef(false)

  // Handle auto-scrolling
  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, autoScroll])

  // Only disable auto-scroll on user interaction
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Ignore programmatic scroll events
    if (!userScrollRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50
    setAutoScroll(isNearBottom)
  }

  // Track when scroll events are from user interaction
  const handleWheel = () => {
    userScrollRef.current = true
  }

  const handleTouchStart = () => {
    userScrollRef.current = true
  }

  // Reset user interaction flag after a short delay
  const handleInteractionEnd = () => {
    setTimeout(() => {
      userScrollRef.current = false
    }, 100)
  }

  return (
    <div className="w-full">
      <Card className="h-[600px] flex flex-col max-w-[400px]">
        <div className="p-4 border-b flex-none">
          <h2 className="font-semibold">Raw output</h2>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4"
          onScroll={handleScroll}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleInteractionEnd}
          onWheelCapture={handleInteractionEnd}
        >
          {messages.length === 0 ? (
            <div className="text-xs text-muted-foreground">Waiting for connection...</div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className="text-xs border-b pb-2">
                  <div className="font-mono whitespace-nowrap min-w-fit">{msg}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
