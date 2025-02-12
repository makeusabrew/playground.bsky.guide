import { useState, useEffect } from 'react'
import { JetstreamConfig } from '@/types/jetstream'
import { useJetstream } from './use-jetstream'
import { JetstreamEvent } from '@/lib/playground/jetstream/types'

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

export function useConnection(onMessage?: (event: JetstreamEvent) => void) {
  const [hasEverConnected, setHasEverConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    connected: false,
    mode: 'restart',
  })

  const [connectionOptions, setConnectionOptions] = useState(DEFAULT_CONNECTION_OPTIONS)

  const jetstream = useJetstream({ ...connectionOptions, onMessage })

  // Handle connection state changes
  useEffect(() => {
    if (connectionState.connected) {
      if (connectionState.mode === 'restart') {
        jetstream.connect()
      } else {
        jetstream.resume()
      }
      setHasEverConnected(true)
    } else {
      jetstream.disconnect()
    }
  }, [connectionState])

  return {
    hasEverConnected,
    connectionState,
    setConnectionState,
    connectionOptions,
    setConnectionOptions,
    messages: jetstream.messages,
  }
}
