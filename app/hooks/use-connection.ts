import { useState } from 'react'
import { JetstreamConfig } from '@/types/jetstream'

export type ConnectionState = {
  connected: boolean
  mode: 'resume' | 'restart'
}

const DEFAULT_CONNECTION_OPTIONS: JetstreamConfig = {
  instance: 'jetstream1.us-east.bsky.network',
  collections: '',
  dids: '',
  cursor: undefined,
  messageLimit: '1000',
}

export function useConnection() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    connected: false,
    mode: 'restart',
  })

  const [connectionOptions, setConnectionOptions] = useState(DEFAULT_CONNECTION_OPTIONS)

  return {
    connectionState,
    setConnectionState,
    connectionOptions,
    setConnectionOptions,
  }
}
