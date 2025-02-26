'use client'
import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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
  ScrollText,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { RecordLinks } from './record-links'

interface StreamViewerProps {
  messages: JetstreamEvent[]
  filteredMessages: JetstreamEvent[]
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

export default function StreamViewer({ messages, filteredMessages }: StreamViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [lag, setLag] = useState<number | null>(null)
  const latestMessageTimeRef = useRef<number | null>(null)
  const [isViewFrozen, setIsViewFrozen] = useState(false)
  const frozenMessagesRef = useRef<JetstreamEvent[]>([])

  // only render last 100 for our protection!
  const displayMessages = isViewFrozen ? frozenMessagesRef.current : filteredMessages.slice(-100)

  // Virtualizer setup
  const virtualizer = useVirtualizer({
    count: displayMessages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 300, // Average height estimate
    overscan: 5, // Pre-render 5 items above and below
    measureElement: (element) => {
      // Get actual height of rendered element
      return element?.getBoundingClientRect().height || 300
    },
  })

  // Keep latest message time updated
  useEffect(() => {
    if (filteredMessages.length > 0) {
      latestMessageTimeRef.current = Math.floor(filteredMessages[filteredMessages.length - 1].time_us / 1000)
    } else {
      latestMessageTimeRef.current = null
    }
  }, [filteredMessages])

  // Store messages when freezing view
  const handleFreezeToggle = () => {
    if (!isViewFrozen) {
      frozenMessagesRef.current = filteredMessages.slice(-100)
    }
    setIsViewFrozen(!isViewFrozen)
  }

  // Update lag every second
  useEffect(() => {
    const updateLag = () => {
      if (latestMessageTimeRef.current === null) {
        setLag(null)
        return
      }
      const now = Date.now()
      setLag(now - latestMessageTimeRef.current)
    }

    updateLag()
    const interval = setInterval(updateLag, 1000)
    return () => clearInterval(interval)
  }, [])

  // Handle auto-scrolling and scroll lock in live mode
  useEffect(() => {
    if (!scrollRef.current || isViewFrozen) return

    const scrollElement = scrollRef.current
    const totalSize = virtualizer.getTotalSize()

    // Scroll to bottom in live mode
    scrollElement.scrollTop = totalSize

    if (!isViewFrozen) {
      // Prevent scroll in live mode
      const preventScroll = (e: WheelEvent) => {
        e.preventDefault()
        scrollElement.scrollTop = totalSize
      }

      scrollElement.addEventListener('wheel', preventScroll, { passive: false })
      return () => scrollElement.removeEventListener('wheel', preventScroll)
    }
  }, [displayMessages, isViewFrozen, virtualizer])

  const getLagStyles = (lagMs: number): string => {
    if (lagMs <= 1000) return 'bg-green-50'
    if (lagMs <= 3000) return 'bg-yellow-100'
    if (lagMs <= 5000) return 'bg-amber-200'
    if (lagMs <= 10000) return 'bg-orange-300'
    if (lagMs <= 60000) return 'bg-red-300'
    return 'bg-red-500'
  }

  return (
    <Card className="h-[calc(100vh-100px)] flex flex-col">
      <div className="py-1.5 px-3 border-b flex-none flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText size={16} className="text-muted-foreground hidden md:block" />
          <h2 className="font-semibold">Message stream</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className={
              isViewFrozen ? 'text-blue-600 hover:text-blue-700' : 'text-muted-foreground hover:text-foreground'
            }
            onClick={handleFreezeToggle}
            title={isViewFrozen ? 'Unfreeze view' : 'Freeze view'}
          >
            {isViewFrozen ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="text-xs">{isViewFrozen ? 'Frozen' : 'Live'}</span>
          </Button>
          {lag !== null && (
            <Badge variant="outline" className={`text-xs ${getLagStyles(lag)}`}>
              Lag: {lag < 1000 ? `${Math.max(lag, 0)}ms` : `${(lag / 1000).toFixed(1)}s`}
            </Badge>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3">
        {displayMessages.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            {messages.length === 0 ? 'Waiting for connection...' : 'No messages match the current filters'}
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const msg = displayMessages[virtualRow.index]
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={`text-xs rounded-md p-2 ${getEventColor(msg)}`}
                >
                  <div className="flex items-center gap-2 mb-1 justify-between">
                    <div className="flex items-center gap-2">
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
                    <RecordLinks event={msg} />
                  </div>
                  <div className="font-mono whitespace-pre-wrap break-all">{JSON.stringify(msg, null, 2)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
