import {
  AppBskyFeedPost,
  AppBskyFeedLike,
  AppBskyFeedRepost,
  AppBskyGraphBlock,
  AppBskyGraphFollow,
  AppBskyActorProfile,
} from '@atproto/api'

interface BaseEvent {
  did: string
  time_us: number
  kind: 'commit' | 'identity' | 'account'
}

export type Like = {
  $type: 'app.bsky.feed.like'
  subject: {
    cid: string
    uri: string
  }
}

export interface CommitEvent extends BaseEvent {
  kind: 'commit'
  commit: {
    rev: string
    operation: 'create' | 'update' | 'delete'
    collection: string
    rkey: string
    record?:
      | AppBskyFeedPost.Record
      | AppBskyFeedLike.Record
      | AppBskyFeedRepost.Record
      | AppBskyGraphBlock.Record
      | AppBskyGraphFollow.Record
      | AppBskyActorProfile.Record
    cid?: string
  }
}

export interface IdentityEvent extends BaseEvent {
  kind: 'identity'
  identity: {
    did: string
    handle: string
    seq: number
    time: string
  }
}

export interface AccountEvent extends BaseEvent {
  kind: 'account'
  account: {
    active: boolean
    did: string
    seq: number
    time: string
  }
}

export type JetstreamEvent = CommitEvent | IdentityEvent | AccountEvent
