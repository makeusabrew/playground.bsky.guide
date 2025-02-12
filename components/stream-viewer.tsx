'use client'
import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { JetstreamEvent } from '@/lib/playground/jetstream/types'
import { Badge } from './ui/badge'

interface StreamViewerProps {
  messages: JetstreamEvent[]
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export default function StreamViewer({ messages }: StreamViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const userScrollRef = useRef(false)

  // only render last 100 for our protection!
  const displayMessages = messages.slice(-100)

  // Handle auto-scrolling
  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [displayMessages, autoScroll])

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

  const getEventColor = (event: JetstreamEvent) => {
    if (event.kind === 'identity') return 'bg-purple-500/10'
    if (event.kind === 'account') return 'bg-blue-500/10'
    if (event.kind === 'commit') {
      switch (event.commit.operation) {
        case 'create':
          return 'bg-green-500/10'
        case 'update':
          return 'bg-yellow-500/10'
        case 'delete':
          return 'bg-red-500/10'
        default:
          return 'bg-gray-500/10'
      }
    }
    return 'bg-gray-500/10'
  }

  const getEventBadgeColor = (event: JetstreamEvent): BadgeVariant => {
    if (event.kind === 'identity') return 'secondary'
    if (event.kind === 'account') return 'secondary'
    if (event.kind === 'commit') {
      switch (event.commit.operation) {
        case 'create':
          return 'default'
        case 'update':
          return 'secondary'
        case 'delete':
          return 'destructive'
        default:
          return 'outline'
      }
    }
    return 'outline'
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="p-4 border-b flex-none flex items-center justify-between">
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
        {displayMessages.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            {messages.length === 0 ? 'Waiting for connection...' : 'No messages match the current filters'}
          </div>
        ) : (
          <div className="space-y-2">
            {displayMessages.map((msg, i) => (
              <div key={i} className={`text-xs rounded-md p-2 ${getEventColor(msg)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getEventBadgeColor(msg)}>
                    {msg.kind === 'commit' ? msg.commit.operation : msg.kind}
                  </Badge>
                  {msg.kind === 'commit' && (
                    <Badge variant="outline" className="font-mono">
                      {msg.commit.collection.split('.').pop()}
                    </Badge>
                  )}
                  <span className="text-muted-foreground">
                    {new Date(Math.floor(msg.time_us / 1000)).toLocaleTimeString()}
                  </span>
                </div>
                <div className="font-mono whitespace-pre-wrap break-all">{JSON.stringify(msg, null, 2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
