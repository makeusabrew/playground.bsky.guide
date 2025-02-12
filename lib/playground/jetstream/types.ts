interface BaseEvent {
  did: string
  time_us: number
  kind: 'commit' | 'identity' | 'account'
}

export type BlobRef = {
  $type: 'blob'
  ref: {
    $link: string
  }
  mimeType: string
  size: number
}

export type AspectRatio = {
  width: number
  height: number
}

export type ImageEmbed = {
  $type: 'app.bsky.embed.images'
  images: {
    alt: string
    image: BlobRef
    aspectRatio?: AspectRatio
  }[]
}

export type ExternalEmbed = {
  $type: 'app.bsky.embed.external'
  external: {
    uri: string
    title: string
    description: string
    thumb?: BlobRef
  }
}

export type RecordEmbed = {
  $type: 'app.bsky.embed.record'
  record: {
    uri: string
    cid: string
  }
}

export type RecordWithMediaEmbed = {
  $type: 'app.bsky.embed.recordWithMedia'
  record: {
    record: {
      uri: string
      cid: string
    }
  }
  media: ImageEmbed
}

export type Reply = {
  root: {
    cid: string
    uri: string
  }
  parent: {
    cid: string
    uri: string
  }
}

export type Embed = ImageEmbed | ExternalEmbed | RecordEmbed | RecordWithMediaEmbed

export type Post = {
  $type: 'app.bsky.feed.post'
  text: string
  createdAt: string
  reply?: Reply
  // is this actually an array?
  embed?: Embed
  langs?: string[]
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
    record?: Post | Like
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
