import type { JetstreamEvent } from './types'
import { createWebSocketClient } from './websocket-client'

type ConsumerOptions = {
  instance: string
  collections?: string[]
  dids?: string[]
  cursor?: number
  compression?: boolean
  onEvent?: (event: JetstreamEvent) => void
  onError?: (error: Error) => void
  onStateChange?: (state: ConsumerState) => void
}

type ConsumerState = {
  status: 'disconnected' | 'connecting' | 'connected' | 'paused'
  cursor?: number
  error?: Error
}

export const createJetstreamConsumer = (options: ConsumerOptions) => {
  let state: ConsumerState = {
    status: 'disconnected',
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
    return `wss://${options.instance}/subscribe${queryString ? '?' + queryString : ''}`
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
        options.onEvent?.(event)
      } catch (err) {
        options.onError?.(new Error('Failed to parse Jetstream event'))
      }
    },
    onOpen: () => updateState({ status: 'connected' }),
    onClose: () => updateState({ status: 'disconnected' }),
    onError: (error) => {
      updateState({ status: 'disconnected', error })
      options.onError?.(error)
    },
  })

  const start = () => {
    updateState({ status: 'connecting' })
    wsClient.connect()
  }

  const pause = () => {
    updateState({ status: 'paused' })
    wsClient.disconnect()
  }

  const resume = () => {
    if (state.status === 'paused') {
      start()
    }
  }

  const updateOptions = (newOptions: Partial<ConsumerOptions>) => {
    Object.assign(options, newOptions)

    // Reconnect with new options if we're currently connected
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
  }
}
