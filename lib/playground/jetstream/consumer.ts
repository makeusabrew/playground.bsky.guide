import type { JetstreamEvent } from './types'
import { createWebSocketClient } from './client'

type ConsumerOptions = {
  instance: string
  collections?: string[]
  dids?: string[]
  cursor?: number
  compression?: boolean
  onMessage: (event: JetstreamEvent) => void
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

    // prioritise state cursor, but we might want a param to change this
    const cursor = state.cursor || options.cursor

    if (options.collections?.length) {
      options.collections.forEach((c) => params.append('wantedCollections', c))
    }
    if (options.dids?.length) {
      options.dids.forEach((d) => params.append('wantedDids', d))
    }
    if (cursor) {
      params.append('cursor', String(cursor))
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
    autoReconnect: true,
    onMessage: (data) => {
      try {
        const event = JSON.parse(data) as JetstreamEvent
        updateState({ cursor: event.time_us })
        options.onMessage(event)
      } catch (err: unknown) {
        console.error(`Failed to parse Jetstream event`, err)
        options.onError?.(new Error('Failed to parse Jetstream event'))
      }
    },
    onOpen: () => updateState({ status: 'connected' }),
    onClose: () => {
      if (!state.intentionalDisconnect) {
        updateState({ status: 'disconnected' })

        console.log(`Consumer was not expecting disconnect - scheduling reconnect in 3s`)
        setTimeout(() => {
          console.log(`Attempting reconnection`)
          start()
        }, 2500)
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
    wsClient.connect(buildConnectionUrl())
  }

  const pause = () => {
    updateState({ status: 'paused', intentionalDisconnect: true })
    wsClient.disconnect()
  }

  const resume = () => {
    updateState({ status: 'connecting', intentionalDisconnect: false })
    wsClient.connect(buildConnectionUrl())
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
  }
}
