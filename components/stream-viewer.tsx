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
  Activity,
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { RecordLinks } from './record-links'
import { format } from 'date-fns'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip'

interface StreamViewerProps {
  filteredMessages: JetstreamEvent[]
}

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

interface PostRecord {
  $type: string
  text?: string
  embed?: {
    $type: string
    images?: Array<{
      alt?: string
      image: {
        $type: string
        ref: { $link: string }
        mimeType: string
      }
    }>
  }
}

const getMessageSummary = (msg: JetstreamEvent) => {
  if (msg.kind === 'commit') {
    if (msg.commit.operation === 'delete') return ''
    switch (msg.commit.collection) {
      case 'app.bsky.feed.post':
        if (msg.commit.record?.$type === 'app.bsky.feed.post') {
          const record = msg.commit.record as PostRecord
          const text = record.text || ''
          return text.length > 100 ? `${text.slice(0, 100)}...` : text
        }
        return 'Post'
      case 'app.bsky.feed.repost':
        return 'Reposted a post'
      case 'app.bsky.feed.like':
        return 'Liked a post'
      case 'app.bsky.graph.follow':
        return 'Followed a user'
      default:
        return msg.commit.collection.split('.').pop()
    }
  }
  return msg.kind
}

export default function StreamViewer({ filteredMessages }: StreamViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [lag, setLag] = useState<number | null>(null)
  const latestMessageTimeRef = useRef<number | null>(null)
  const [isViewFrozen, setIsViewFrozen] = useState(false)
  const frozenMessagesRef = useRef<JetstreamEvent[]>([])
  const [velocity, setVelocity] = useState(0)
  const lastMessageCountRef = useRef(0)
  const lastUpdateTimeRef = useRef(Date.now())

  const displayMessages = isViewFrozen ? frozenMessagesRef.current : filteredMessages

  // Virtualizer setup with fixed height for table rows
  const virtualizer = useVirtualizer({
    count: displayMessages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 40, // Height of a table row
    overscan: 5,
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
      frozenMessagesRef.current = filteredMessages.slice()
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

  // Handle auto-scrolling
  useEffect(() => {
    if (isViewFrozen) return

    virtualizer.scrollToIndex(displayMessages.length - 1, {
      align: 'end',
    })
  }, [displayMessages, isViewFrozen, virtualizer])

  // Calculate message velocity
  useEffect(() => {
    const now = Date.now()
    const timeDiff = now - lastUpdateTimeRef.current
    const messageDiff = filteredMessages.length - lastMessageCountRef.current

    if (timeDiff >= 1000) {
      setVelocity(Math.round((messageDiff / timeDiff) * 1000))
      lastMessageCountRef.current = filteredMessages.length
      lastUpdateTimeRef.current = now
    }
  }, [filteredMessages])

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="gap-1">
                  <Activity size={12} />
                  {velocity}/s
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Messages per second</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="min-w-full">
          {/* Header */}
          {/* <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
            <div className="grid grid-cols-[8rem_6rem_8rem_1fr_6rem] gap-3 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div>Timestamp</div>
              <div>Operation</div>
              <div>Collection</div>
              <div>Content</div>
              <div className="text-right">Actions</div>
            </div>
          </div> */}

          {/* Virtualized Rows */}
          <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const msg = displayMessages[virtualRow.index]
              return (
                <div
                  key={virtualRow.key}
                  className={`${getEventColor(msg)} transition-colors absolute w-full border-b`}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="grid grid-cols-[6rem_4rem_4rem_1fr_4rem] gap-3 px-4 py-2.5 items-center h-full">
                    <div className="font-mono text-xs text-muted-foreground truncate">
                      {format(Math.floor(msg.time_us / 1000), 'HH:mm:ss.SSS')}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs">
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
                      </div>
                    </div>
                    <div>
                      {msg.kind === 'commit' && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {getCollectionIcon(msg.commit.collection)}
                          {msg.commit.collection.split('.').pop()}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{getMessageSummary(msg)}</div>
                    <div className="text-right">
                      <RecordLinks event={msg} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
