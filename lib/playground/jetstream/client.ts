type WebSocketClientOptions = {
  url: string
  onMessage?: (data: string) => void
  onError?: (error: Error) => void
  onClose?: () => void
  onOpen?: () => void
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  reconnectDelay?: number
  shouldReconnect?: () => boolean
}

type WebSocketClientState = {
  isConnected: boolean
  reconnectAttempts: number
  lastCursor?: number // microseconds timestamp from last message
}

export const createWebSocketClient = (options: WebSocketClientOptions) => {
  let ws: WebSocket | null = null
  let state: WebSocketClientState = {
    isConnected: false,
    reconnectAttempts: 0,
  }

  const getState = () => ({ ...state })

  const connect = () => {
    if (ws?.readyState === WebSocket.OPEN) return

    ws = new WebSocket(options.url)

    ws.onopen = () => {
      state = {
        ...state,
        isConnected: true,
        reconnectAttempts: 0,
      }
      options.onOpen?.()
    }

    ws.onmessage = (event) => {
      try {
        // Update cursor from message if present
        const data = JSON.parse(event.data)
        if ('time_us' in data) {
          state = {
            ...state,
            lastCursor: data.time_us,
          }
        }
        options.onMessage?.(event.data)
      } catch (err: unknown) {
        options.onError?.(new Error('Failed to parse message'))
      }
    }

    ws.onerror = (error: unknown) => {
      options.onError?.(new Error('WebSocket error'))
    }

    ws.onclose = () => {
      state = {
        ...state,
        isConnected: false,
      }
      options.onClose?.()

      if (
        options.autoReconnect &&
        (!options.maxReconnectAttempts || state.reconnectAttempts < options.maxReconnectAttempts) &&
        (options.shouldReconnect?.() ?? true)
      ) {
        state = {
          ...state,
          reconnectAttempts: state.reconnectAttempts + 1,
        }
        setTimeout(connect, options.reconnectDelay || 1000)
      }
    }
  }

  const disconnect = () => {
    if (ws) {
      ws.close()
      ws = null
    }
  }

  const send = (data: string) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(data)
    }
  }

  return {
    connect,
    disconnect,
    send,
    getState,
  }
}
