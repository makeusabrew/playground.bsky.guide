type WebSocketClientOptions = {
  url: string
  onMessage: (data: string) => void
  onError: (error: Error) => void
  onClose: () => void
  onOpen: () => void
  autoReconnect?: boolean
  maxReconnectAttempts?: number
  reconnectDelay?: number
  shouldReconnect?: () => boolean
}

type WebSocketClientState = {
  isConnected: boolean
  reconnectAttempts: number
}

export const createWebSocketClient = (options: WebSocketClientOptions) => {
  let ws: WebSocket | null = null
  let state: WebSocketClientState = {
    isConnected: false,
    reconnectAttempts: 0,
  }

  const connect = (cursor?: number) => {
    if (ws?.readyState === WebSocket.OPEN) return

    // FIXME: this is a bodge; cursor should be baked into the original URL
    const separator = options.url.includes('?') ? '&' : '?'
    ws = new WebSocket(`${options.url}${separator}${cursor ? `cursor=${cursor}` : ''}`)

    ws.onopen = () => {
      state = {
        isConnected: true,
        reconnectAttempts: 0,
      }
      options.onOpen()
    }

    ws.onmessage = (event) => {
      options.onMessage(event.data)
    }

    ws.onerror = (error: Event) => {
      console.warn(`WebSocket error: ${error}`)
      options.onError(new Error('WebSocket error'))
    }

    ws.onclose = () => {
      state = {
        ...state,
        isConnected: false,
      }
      options.onClose()

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
  }
}
