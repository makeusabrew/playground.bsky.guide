'use client'
import React from 'react'
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
  ScrollText,
  Eye,
  EyeOff,
  UserPlus,
  UserCheck,
  MessageCircle,
  ArrowUpRight,
} from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import {
  AppBskyFeedPost,
  AppBskyFeedLike,
  AppBskyFeedRepost,
  AppBskyGraphBlock,
  AppBskyGraphFollow,
} from '@atproto/api'

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

const RecordLinks = ({ event }: { event: JetstreamEvent }) => {
  if (event.kind !== 'commit' || !event.commit.record) return null

  const links: { href: string; icon: React.ReactNode; label: string; className?: string }[] = []
  const record = event.commit.record

  // Helper to create profile URL
  const profileUrl = (did: string) => `https://bsky.app/profile/${did}`

  // Helper to create post URL
  const postUrl = (uri: string) => {
    const [did, , rkey] = uri.replace('at://', '').split('/')
    return `https://bsky.app/profile/${did}/post/${rkey}`
  }

  switch (event.commit.collection) {
    case 'app.bsky.feed.post': {
      const postRecord = record as AppBskyFeedPost.Record
      links.push({
        href: postUrl(`at://${event.did}/${event.commit.collection}/${event.commit.rkey}`),
        icon: <MessageCircle size={14} />,
        label: 'View post',
        className: 'hover:text-blue-500',
      })
      links.push({
        href: profileUrl(event.did),
        icon: <UserRound size={14} />,
        label: 'View author',
        className: 'hover:text-violet-500',
      })
      if (postRecord.reply?.parent) {
        links.push({
          href: postUrl(postRecord.reply.parent.uri),
          icon: <ArrowUpRight size={14} />,
          label: 'View parent post',
          className: 'hover:text-emerald-500',
        })
      }
      break
    }
    case 'app.bsky.feed.like': {
      const likeRecord = record as AppBskyFeedLike.Record
      links.push({
        href: profileUrl(event.did),
        icon: <UserRound size={14} />,
        label: 'View liker',
        className: 'hover:text-violet-500',
      })
      links.push({
        href: postUrl(likeRecord.subject.uri),
        icon: <Heart size={14} />,
        label: 'View liked post',
        className: 'hover:text-rose-500',
      })
      break
    }
    case 'app.bsky.feed.repost': {
      const repostRecord = record as AppBskyFeedRepost.Record
      links.push({
        href: profileUrl(event.did),
        icon: <UserRound size={14} />,
        label: 'View reposter',
        className: 'hover:text-violet-500',
      })
      links.push({
        href: postUrl(repostRecord.subject.uri),
        icon: <Repeat size={14} />,
        label: 'View reposted post',
        className: 'hover:text-emerald-500',
      })
      break
    }
    case 'app.bsky.graph.follow': {
      const followRecord = record as AppBskyGraphFollow.Record
      links.push({
        href: profileUrl(event.did),
        icon: <UserPlus size={14} />,
        label: 'View follower',
        className: 'hover:text-violet-500',
      })
      links.push({
        href: profileUrl(followRecord.subject),
        icon: <UserCheck size={14} />,
        label: 'View followed user',
        className: 'hover:text-emerald-500',
      })
      break
    }
    case 'app.bsky.graph.block': {
      const blockRecord = record as AppBskyGraphBlock.Record
      links.push({
        href: profileUrl(event.did),
        icon: <UserRound size={14} />,
        label: 'View blocker',
        className: 'hover:text-violet-500',
      })
      links.push({
        href: profileUrl(blockRecord.subject),
        icon: <Ban size={14} />,
        label: 'View blocked user',
        className: 'hover:text-red-500',
      })
      break
    }
    case 'app.bsky.actor.profile': {
      links.push({
        href: profileUrl(event.did),
        icon: <UserRound size={14} />,
        label: 'View profile',
        className: 'hover:text-violet-500',
      })
      break
    }
  }

  if (links.length === 0) return null

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {links.map((link, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${link.className || 'hover:text-blue-500'}`}
              >
                {link.icon}
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{link.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}

export default function StreamViewer({ messages, filteredMessages }: StreamViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [lag, setLag] = useState<number | null>(null)
  const latestMessageTimeRef = useRef<number | null>(null)
  const [isViewFrozen, setIsViewFrozen] = useState(false)
  const frozenMessagesRef = useRef<JetstreamEvent[]>([])

  // only render last 100 for our protection!
  const displayMessages = isViewFrozen ? frozenMessagesRef.current : filteredMessages.slice(-100)

  // Keep latest message time updated
  useEffect(() => {
    // Always update the latest message time from filtered messages, even when view is frozen
    if (filteredMessages.length > 0) {
      latestMessageTimeRef.current = Math.floor(filteredMessages[filteredMessages.length - 1].time_us / 1000)
    } else {
      latestMessageTimeRef.current = null
    }
  }, [filteredMessages])

  // Store messages when freezing view
  const handleFreezeToggle = () => {
    if (!isViewFrozen) {
      // When freezing, store current messages
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

    // Initial update
    updateLag()

    // Update every second
    const interval = setInterval(updateLag, 1000)
    return () => clearInterval(interval)
  }, []) // No dependencies needed - we use the ref

  // Handle auto-scrolling - always scroll to bottom when live, allow manual scroll when frozen
  useEffect(() => {
    if (isViewFrozen || !scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [displayMessages, isViewFrozen])

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
      <div className="py-2 px-4 border-b flex-none flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText size={16} className="text-muted-foreground hidden md:block" />
          <h2 className="font-semibold">Message stream</h2>
        </div>

        <div className="flex items-center gap-2">
          {lag !== null && (
            <Badge variant="outline" className={`text-xs ${getLagStyles(lag)}`}>
              Lag: {lag < 1000 ? `${Math.max(lag, 0)}ms` : `${(lag / 1000).toFixed(1)}s`}
            </Badge>
          )}
          <Button
            variant={isViewFrozen ? 'default' : 'outline'}
            size="sm"
            className="gap-1"
            onClick={handleFreezeToggle}
            title={isViewFrozen ? 'Resume live updates' : 'Pause live updates'}
          >
            {isViewFrozen ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="text-xs">{isViewFrozen ? 'Frozen' : 'Live'}</span>
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3">
        {displayMessages.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            {messages.length === 0 ? 'Waiting for connection...' : 'No messages match the current filters'}
          </div>
        ) : (
          <div className="space-y-2">
            {displayMessages.map((msg, i) => (
              <div key={i} className={`text-xs rounded-md p-2 ${getEventColor(msg)}`}>
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
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
