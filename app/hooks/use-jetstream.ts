import { useState, useCallback } from 'react'
import { createJetstreamConsumer } from '@/lib/playground/jetstream/consumer'
import type { JetstreamEvent } from '@/lib/playground/jetstream/types'
import { JetstreamConfig } from '@/types/jetstream'

type JetstreamStatus = 'disconnected' | 'connecting' | 'connected' | 'paused'

type UseJetstreamOptions = JetstreamConfig & {
  onMessage?: (event: JetstreamEvent) => void
}

export const useJetstream = (options: UseJetstreamOptions) => {
  const [status, setStatus] = useState<JetstreamStatus>('disconnected')
  const [error, setError] = useState<Error | undefined>()
  const [messages, setMessages] = useState<JetstreamEvent[]>([])

  // Parse message limit with fallback
  const limit = Math.max(1, Math.min(100000, parseInt(options.messageLimit || '1000', 10)))

  const collections = options.collections
    ?.split(',')
    .map((c) => c.trim())
    .filter(Boolean)

  const dids = options.dids
    ?.split(',')
    .map((d) => d.trim())
    .filter(Boolean)

  const consumer = createJetstreamConsumer({
    instance: options.instance,
    collections,
    dids,
    cursor: options.cursor ? parseInt(options.cursor, 10) : undefined,
    compression: false,
    onMessage: (event) => {
      setMessages((prev) => {
        const newMessages = [...prev, event]
        return newMessages.slice(-limit)
      })
      options.onMessage?.(event)
    },
    onError: (error) => {
      setError(error)
    },
    onStateChange: (state) => {
      setStatus(state.status)
      setError(state.error)
    },
  })

  const connect = useCallback(() => {
    setMessages([])
    consumer.start()
  }, [consumer])

  const resume = useCallback(() => {
    consumer.resume()
  }, [consumer])

  const disconnect = useCallback(() => {
    consumer.pause()
  }, [consumer])

  return {
    status,
    error,
    messages,
    connect,
    resume,
    disconnect,
  }
}
