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
  ChevronRight,
  Activity,
  X,
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { RecordLinks } from './record-links'
import { format } from 'date-fns'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip'

interface StreamViewerProps {
  messages: JetstreamEvent[]
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

const ExpandedMessage = ({ msg, onClose }: { msg: JetstreamEvent; onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`relative w-[90%] max-w-3xl max-h-[90vh] overflow-auto rounded-lg ${getEventColor(
          msg
        )} dark:bg-slate-900 p-4 border border-border/50`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <X size={16} />
        </button>
        <div className="font-mono whitespace-pre-wrap break-all text-[10px] mt-4">{JSON.stringify(msg, null, 2)}</div>
      </div>
    </div>
  )
}

const MessageSummary = ({
  msg,
  index,
  isExpanded,
  onExpandChange,
}: {
  msg: JetstreamEvent
  index: number
  isExpanded: boolean
  onExpandChange: (expanded: boolean) => void
}) => {
  const messageRef = useRef<HTMLDivElement>(null)

  // Enhanced summary with rich content
  const getSummary = () => {
    if (msg.kind === 'commit') {
      switch (msg.commit.collection) {
        case 'app.bsky.feed.post':
          if (msg.commit.record?.$type === 'app.bsky.feed.post') {
            const record = msg.commit.record as PostRecord
            const text = record.text || ''
            return (
              <div className="flex flex-col gap-1">
                <span>
                  {text.slice(0, 100)}
                  {text.length > 100 ? '...' : ''}
                </span>
                {record.embed?.images && (
                  <span className="text-muted-foreground">
                    📷 {record.embed.images.length} image{record.embed.images.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )
          }
          return 'Post'
        case 'app.bsky.feed.repost':
          return (
            <div className="flex items-center gap-1">
              <Repeat size={12} className="text-muted-foreground" />
              <span>Reposted a post</span>
            </div>
          )
        case 'app.bsky.feed.like':
          return (
            <div className="flex items-center gap-1">
              <Heart size={12} className="text-muted-foreground" />
              <span>Liked a post</span>
            </div>
          )
        case 'app.bsky.graph.follow':
          return (
            <div className="flex items-center gap-1">
              <Users size={12} className="text-muted-foreground" />
              <span>Followed a user</span>
            </div>
          )
        default:
          return msg.commit.collection.split('.').pop()
      }
    }
    return msg.kind
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!messageRef.current?.contains(document.activeElement)) return

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onExpandChange(!isExpanded)
      }
      if (e.key === 'Escape' && isExpanded) {
        e.preventDefault()
        onExpandChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded, onExpandChange])

  return (
    <div className="relative">
      <div
        ref={messageRef}
        className={`group ${getEventColor(
          msg
        )} dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800/50 h-16 rounded-md text-xs transition-all overflow-hidden border border-border/50`}
        onClick={() => onExpandChange(!isExpanded)}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        data-index={index}
      >
        <div className="p-2">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground tabular-nums">
                {format(Math.floor(msg.time_us / 1000), 'HH:mm:ss.SSS')}
              </span>
              {/* Operation type */}
              <div className="w-[60px] flex items-center gap-1.5 font-medium">
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

              {/* Collection type */}
              {msg.kind === 'commit' && (
                <div className="w-[48px] flex items-center gap-1.5 text-muted-foreground">
                  {getCollectionIcon(msg.commit.collection)}
                  {msg.commit.collection.split('.').pop()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <RecordLinks event={msg} />
              <ChevronRight
                size={16}
                className={`text-muted-foreground/50 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                } opacity-100 group-hover:opacity-100`}
              />
            </div>
          </div>

          <div className="mt-2 text-muted-foreground">{getSummary()}</div>
        </div>
      </div>

      {isExpanded && (
        <div
          className={`absolute left-0 right-0 z-50 mt-1 rounded-lg ${getEventColor(
            msg
          )} dark:bg-slate-900/95 bg-opacity-95 backdrop-blur-sm p-4 border border-border/50 shadow-lg`}
        >
          <button
            onClick={() => onExpandChange(false)}
            className="absolute top-2 right-2 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
          <div className="font-mono whitespace-pre-wrap break-all text-[10px] mt-4">{JSON.stringify(msg, null, 2)}</div>
        </div>
      )}
    </div>
  )
}

export default function StreamViewer({ messages, filteredMessages }: StreamViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [lag, setLag] = useState<number | null>(null)
  const latestMessageTimeRef = useRef<number | null>(null)
  const [isViewFrozen, setIsViewFrozen] = useState(false)
  const frozenMessagesRef = useRef<JetstreamEvent[]>([])
  const [velocity, setVelocity] = useState(0)
  const lastMessageCountRef = useRef(0)
  const lastUpdateTimeRef = useRef(Date.now())
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const displayMessages = isViewFrozen ? frozenMessagesRef.current : filteredMessages

  // Virtualizer setup with fixed height
  const virtualizer = useVirtualizer({
    count: displayMessages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 64, // Back to fixed height since expanded view is in an overlay
    overscan: 5,
    gap: 10,
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

  // Handle auto-scrolling and scroll lock in live mode
  useEffect(() => {
    if (isViewFrozen) return

    virtualizer.scrollToIndex(displayMessages.length - 1, {
      align: 'end',
    })
  }, [displayMessages, isViewFrozen, virtualizer])

  // Calculate message velocity (messages per second)
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

  const handleMessageExpand = (index: number, isExpanded: boolean) => {
    setExpandedIndex(isExpanded ? index : null)
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
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <MessageSummary
                    msg={msg}
                    index={virtualRow.index}
                    isExpanded={expandedIndex === virtualRow.index}
                    onExpandChange={(expanded) => handleMessageExpand(virtualRow.index, expanded)}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
