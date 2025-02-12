import { useState, useEffect, useCallback } from 'react'
import { createJetstreamConsumer } from '../../lib/playground/jetstream/consumer'

type UseJetstreamOptions = {
  instance: string
  collections?: string
  dids?: string
  cursor?: string
  compression?: boolean
}

type JetstreamStatus = 'disconnected' | 'connecting' | 'connected' | 'paused'

export const useJetstream = (options: UseJetstreamOptions) => {
  const [status, setStatus] = useState<JetstreamStatus>('disconnected')
  const [error, setError] = useState<Error | undefined>()
  const [messages, setMessages] = useState<string[]>([])

  // Create consumer with initial options
  const consumer = createJetstreamConsumer({
    instance: options.instance,
    collections: options.collections
      ?.split(',')
      .map((c) => c.trim())
      .filter(Boolean),
    dids: options.dids
      ?.split(',')
      .map((d) => d.trim())
      .filter(Boolean),
    cursor: options.cursor ? parseInt(options.cursor, 10) : undefined,
    compression: options.compression,
    onEvent: (event) => {
      setMessages((prev) => [...prev, JSON.stringify(event, null, 2)])
    },
    onError: (error) => {
      setError(error)
    },
    onStateChange: (state) => {
      setStatus(state.status)
      setError(state.error)
    },
  })

  // Update consumer when options change
  useEffect(() => {
    consumer.updateOptions({
      instance: options.instance,
      collections: options.collections
        ?.split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      dids: options.dids
        ?.split(',')
        .map((d) => d.trim())
        .filter(Boolean),
      cursor: options.cursor ? parseInt(options.cursor, 10) : undefined,
      compression: options.compression,
    })
  }, [options.instance, options.collections, options.dids, options.cursor, options.compression])

  const connect = useCallback(() => {
    setMessages([])
    consumer.start()
  }, [])

  const disconnect = useCallback(() => {
    consumer.pause()
  }, [])

  return {
    status,
    error,
    messages,
    connect,
    disconnect,
  }
}
