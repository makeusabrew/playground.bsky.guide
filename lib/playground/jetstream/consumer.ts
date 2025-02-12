import type { JetstreamEvent, JetstreamMetrics } from './types'
import { createWebSocketClient } from './client'

type ConsumerOptions = {
  instance: string
  collections?: string[]
  dids?: string[]
  cursor?: number
  compression?: boolean
  onEvent?: (event: JetstreamEvent) => void
  onError?: (error: Error) => void
  onStateChange?: (state: ConsumerState) => void
  onMetrics?: (metrics: JetstreamMetrics) => void
}

type ConsumerState = {
  status: 'disconnected' | 'connecting' | 'connected' | 'paused'
  cursor?: number
  error?: Error
  intentionalDisconnect?: boolean
}

export const createJetstreamConsumer = (options: ConsumerOptions) => {
  console.log(`createJetstreamConsumer options`, options)
  let state: ConsumerState = {
    status: 'disconnected',
    intentionalDisconnect: false,
  }

  // Metrics state
  let metrics: JetstreamMetrics = {
    totalMessages: 0,
    messagesByCollection: {},
    totalCreates: 0,
    totalDeletes: 0,
    messagesPerSecond: 0,
    createPerSecond: 0,
    deletePerSecond: 0,
    collectionRates: {},
    lastUpdate: Date.now(),
  }

  // Recent events for rate calculation
  const recentMessages: { timestamp: number; collection?: string; operation?: string }[] = []
  const RATE_WINDOW = 5000 // 5 second window for rate calculation

  const updateMetrics = (event: JetstreamEvent) => {
    // Update totals
    metrics.totalMessages++

    if (event.kind === 'commit') {
      const collection = event.commit.collection
      metrics.messagesByCollection[collection] = (metrics.messagesByCollection[collection] || 0) + 1

      if (event.commit.operation === 'create') {
        metrics.totalCreates++
      } else if (event.commit.operation === 'delete') {
        metrics.totalDeletes++
      }
    }

    // Add to recent messages
    recentMessages.push({
      timestamp: Date.now(),
      collection: event.kind === 'commit' ? event.commit.collection : undefined,
      operation: event.kind === 'commit' ? event.commit.operation : undefined,
    })

    // Remove old messages
    const cutoff = Date.now() - RATE_WINDOW
    while (recentMessages.length > 0 && recentMessages[0].timestamp < cutoff) {
      recentMessages.shift()
    }

    // Calculate rates
    const windowSeconds = RATE_WINDOW / 1000
    metrics.messagesPerSecond = recentMessages.length / windowSeconds

    // Calculate operation rates
    const recentCreates = recentMessages.filter((m) => m.operation === 'create').length
    const recentDeletes = recentMessages.filter((m) => m.operation === 'delete').length
    metrics.createPerSecond = recentCreates / windowSeconds
    metrics.deletePerSecond = recentDeletes / windowSeconds

    // Calculate collection rates
    const collections = new Set(recentMessages.map((m) => m.collection).filter(Boolean))
    metrics.collectionRates = {}
    collections.forEach((collection) => {
      if (collection) {
        const count = recentMessages.filter((m) => m.collection === collection).length
        metrics.collectionRates[collection] = count / windowSeconds
      }
    })

    metrics.lastUpdate = Date.now()
    options.onMetrics?.(metrics)
  }

  const buildConnectionUrl = () => {
    const params = new URLSearchParams()

    if (options.collections?.length) {
      options.collections.forEach((c) => params.append('wantedCollections', c))
    }
    if (options.dids?.length) {
      options.dids.forEach((d) => params.append('wantedDids', d))
    }
    if (options.cursor || state.cursor) {
      params.append('cursor', String(options.cursor || state.cursor))
    }
    if (options.compression) {
      params.append('compress', 'true')
    }

    const queryString = params.toString()
    const url = `wss://${options.instance}/subscribe${queryString ? '?' + queryString : ''}`
    console.log(`buildConnectionUrl`, url)
    return url
  }

  const updateState = (newState: Partial<ConsumerState>) => {
    state = { ...state, ...newState }
    options.onStateChange?.(state)
  }

  const wsClient = createWebSocketClient({
    url: buildConnectionUrl(),
    autoReconnect: true,
    onMessage: (data) => {
      try {
        const event = JSON.parse(data) as JetstreamEvent
        updateState({ cursor: event.time_us })
        updateMetrics(event)
        options.onEvent?.(event)
      } catch (err: unknown) {
        options.onError?.(new Error('Failed to parse Jetstream event'))
      }
    },
    onOpen: () => updateState({ status: 'connected', intentionalDisconnect: false }),
    onClose: () => {
      if (!state.intentionalDisconnect) {
        updateState({ status: 'disconnected' })
      }
    },
    onError: (error) => {
      if (!state.intentionalDisconnect) {
        updateState({ status: 'disconnected', error })
        options.onError?.(error)
      }
    },
    shouldReconnect: () => !state.intentionalDisconnect,
  })

  const start = () => {
    updateState({ status: 'connecting', intentionalDisconnect: false })
    wsClient.connect()
  }

  const pause = () => {
    updateState({ status: 'paused', intentionalDisconnect: true })
    wsClient.disconnect()
  }

  const resume = () => {
    if (state.status === 'paused') {
      start()
    }
  }

  const updateOptions = (newOptions: Partial<ConsumerOptions>) => {
    Object.assign(options, newOptions)

    if (state.status === 'connected') {
      wsClient.disconnect()
      start()
    }
  }

  return {
    start,
    pause,
    resume,
    updateOptions,
    getState: () => ({ ...state }),
    getMetrics: () => ({ ...metrics }),
  }
}
