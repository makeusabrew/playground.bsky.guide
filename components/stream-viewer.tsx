'use client'
import { useEffect, useRef, useState } from 'react'
import { JetstreamEvent } from '@/lib/playground/jetstream/types'
import { Badge } from './ui/badge'
import {
  Plus,
  Pencil,
  Trash,
  UserRound,
  ShieldCheck,
  MessageSquare,
  Heart,
  Repeat,
  Users,
  Ban,
  User,
  PlayCircle,
} from 'lucide-react'

interface StreamViewerProps {
  messages: JetstreamEvent[]
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

const getOperationIcon = (operation: string) => {
  switch (operation) {
    case 'create':
      return <Plus size={14} />
    case 'update':
      return <Pencil size={14} />
    case 'delete':
      return <Trash size={14} />
    default:
      return null
  }
}

const getCollectionIcon = (collection: string) => {
  switch (collection) {
    case 'app.bsky.feed.post':
      return <MessageSquare size={14} />
    case 'app.bsky.feed.like':
      return <Heart size={14} />
    case 'app.bsky.feed.repost':
      return <Repeat size={14} />
    case 'app.bsky.graph.follow':
      return <Users size={14} />
    case 'app.bsky.graph.block':
      return <Ban size={14} />
    case 'app.bsky.actor.profile':
      return <User size={14} />
    default:
      return null
  }
}

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
    <div className="h-[600px] flex flex-col">
      <div className="p-4 border-b flex-none flex items-center gap-2">
        <PlayCircle size={16} className="text-muted-foreground" />
        <h2 className="font-semibold">Real-time message stream</h2>
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
                  <Badge variant={getEventBadgeColor(msg)} className="flex items-center gap-1.5">
                    {msg.kind === 'commit' ? (
                      <>
                        {getOperationIcon(msg.commit.operation)}
                        {msg.commit.operation}
                      </>
                    ) : msg.kind === 'identity' ? (
                      <>
                        <UserRound size={14} />
                        {msg.kind}
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} />
                        {msg.kind}
                      </>
                    )}
                  </Badge>
                  {msg.kind === 'commit' && (
                    <Badge variant="outline" className="flex items-center gap-1.5 font-mono">
                      {getCollectionIcon(msg.commit.collection)}
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
    </div>
  )
}
