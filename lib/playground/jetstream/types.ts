import {
  AppBskyFeedPost,
  AppBskyFeedLike,
  AppBskyFeedRepost,
  AppBskyGraphBlock,
  AppBskyGraphFollow,
  AppBskyActorProfile,
} from '@atproto/api'

export interface CommitEvent {
  did: string
  time_us: number
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

export interface IdentityEvent {
  did: string
  time_us: number
  kind: 'identity'
  identity: {
    did: string
    handle: string
    seq: number
    time: string
  }
}

export interface AccountEvent {
  did: string
  time_us: number
  kind: 'account'
  account: {
    active: boolean
    did: string
    seq: number
    time: string
  }
}

export type JetstreamEvent = CommitEvent | IdentityEvent | AccountEvent
