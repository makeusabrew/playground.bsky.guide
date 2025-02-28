import { JetstreamEvent } from '@/lib/playground/jetstream/types'
import { MessageCircle, UserRound, ArrowUpRight, Heart, Repeat, UserPlus, UserCheck, Ban } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import {
  AppBskyFeedPost,
  AppBskyFeedLike,
  AppBskyFeedRepost,
  AppBskyGraphBlock,
  AppBskyGraphFollow,
} from '@atproto/api'

export const RecordLinks = ({ event }: { event: JetstreamEvent }) => {
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
