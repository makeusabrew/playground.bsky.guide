type WebSocketClientOptions = {
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

  const connect = (url: string) => {
    if (ws?.readyState === WebSocket.OPEN) return

    console.log(`Connecting WebSocket to ${url}`)

    ws = new WebSocket(url)

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
      console.warn(`WebSocket error: ${error.toString()}`)
      options.onError(new Error('WebSocket error'))
    }

    ws.onclose = () => {
      console.log(`WebSocket onclose() event fired`)
      state = {
        ...state,
        isConnected: false,
      }
      options.onClose()
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
