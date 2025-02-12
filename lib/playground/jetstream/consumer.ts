import type { JetstreamEvent } from './types'
import { createWebSocketClient } from './client'
import type { MetricsManager } from './metrics-manager'

type ConsumerOptions = {
  instance: string
  collections?: string[]
  dids?: string[]
  cursor?: number
  compression?: boolean
  metricsManager: MetricsManager
  onEvent?: (event: JetstreamEvent) => void
  onError?: (error: Error) => void
  onStateChange?: (state: ConsumerState) => void
}

type ConsumerState = {
  status: 'disconnected' | 'connecting' | 'connected' | 'paused'
  cursor?: number
  error?: Error
  intentionalDisconnect?: boolean
}

export const createJetstreamConsumer = (options: ConsumerOptions) => {
  let state: ConsumerState = {
    status: 'disconnected',
    intentionalDisconnect: false,
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
        options.metricsManager.updateMetrics(event)
        options.onEvent?.(event)
      } catch (err: unknown) {
        console.error(`Failed to parse Jetstream event`, err)
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
    options.metricsManager.reset()
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
    getMetrics: () => options.metricsManager.getMetrics(),
  }
}
