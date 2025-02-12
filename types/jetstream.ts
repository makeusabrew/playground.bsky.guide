export interface ConnectionOptions {
  instance: string
  wantedCollections: string[]
  wantedDids: string[]
  maxMessageSizeBytes: number
  cursor?: string
  compress: boolean
  requireHello: boolean
}

export interface JetstreamConfig {
  instance: string
  collections: string
  dids: string
  cursor: string
  messageLimit: string
}
