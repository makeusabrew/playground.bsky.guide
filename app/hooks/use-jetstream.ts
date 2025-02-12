import { useState, useEffect, useCallback } from 'react'
import { createJetstreamConsumer } from '@/lib/playground/jetstream/consumer'
import type { JetstreamMetrics } from '@/lib/playground/jetstream/types'

type UseJetstreamOptions = {
  instance: string
  collections?: string
  dids?: string
  cursor?: string
  compression?: boolean
  messageLimit?: string
}

type JetstreamStatus = 'disconnected' | 'connecting' | 'connected' | 'paused'

export const useJetstream = (options: UseJetstreamOptions) => {
  const [status, setStatus] = useState<JetstreamStatus>('disconnected')
  const [error, setError] = useState<Error | undefined>()
  const [messages, setMessages] = useState<string[]>([])
  const [metrics, setMetrics] = useState<JetstreamMetrics>({
    totalMessages: 0,
    messagesByCollection: {},
    totalCreates: 0,
    totalDeletes: 0,
    messagesPerSecond: 0,
    createPerSecond: 0,
    deletePerSecond: 0,
    collectionRates: {},
    lastUpdate: Date.now(),
  })

  // Parse message limit with fallback
  const limit = Math.max(1, Math.min(100000, parseInt(options.messageLimit || '1000', 10)))

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
      setMessages((prev) => {
        const newMessages = [...prev, JSON.stringify(event, null, 2)]
        // Keep only the most recent messages up to the limit
        return newMessages.slice(-limit)
      })
    },
    onError: (error) => {
      setError(error)
    },
    onStateChange: (state) => {
      setStatus(state.status)
      setError(state.error)
    },
    onMetrics: (newMetrics) => {
      setMetrics(newMetrics)
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
    metrics,
    connect,
    disconnect,
  }
}
