type WebSocketClientOptions = {
  onMessage: (data: string) => void
  onError: (error: Error) => void
  onClose: () => void
  onOpen: () => void
  onNetworkEvent?: (event: {
    type: 'websocket'
    action: string
    details?: string
    status?: 'success' | 'error' | 'pending'
    url?: string
  }) => string | void
}

export const createWebSocketClient = (options: WebSocketClientOptions) => {
  let ws: WebSocket | null = null

  const connect = (url: string) => {
    if (ws?.readyState === WebSocket.OPEN) return

    console.log(`Connecting WebSocket to ${url}`)

    // Log connection attempt
    options.onNetworkEvent?.({
      type: 'websocket',
      action: 'Connecting',
      status: 'pending',
      url,
    })

    ws = new WebSocket(url)

    ws.onopen = () => {
      options.onNetworkEvent?.({
        type: 'websocket',
        action: 'Connected',
        status: 'success',
        url,
      })
      options.onOpen()
    }

    ws.onmessage = (event) => {
      options.onMessage(event.data)
    }

    ws.onerror = (error: Event) => {
      console.warn(`WebSocket error: ${error.toString()}`)
      options.onNetworkEvent?.({
        type: 'websocket',
        action: 'Error',
        status: 'error',
        details: 'Connection error',
        url,
      })
      options.onError(new Error('WebSocket error'))
    }

    ws.onclose = () => {
      console.log(`WebSocket onclose() event fired`)
      options.onNetworkEvent?.({
        type: 'websocket',
        action: 'Disconnected',
        url,
      })
      options.onClose()
    }
  }

  const disconnect = () => {
    if (ws) {
      const url = ws.url
      options.onNetworkEvent?.({
        type: 'websocket',
        action: 'Disconnecting',
        status: 'pending',
        url,
      })
      ws.close()
      ws = null
    }
  }

  const send = (data: string) => {
    if (ws?.readyState === WebSocket.OPEN) {
      options.onNetworkEvent?.({
        type: 'websocket',
        action: 'Sending message',
        status: 'pending',
        details: data.substring(0, 100) + (data.length > 100 ? '...' : ''),
      })

      try {
        ws.send(data)
        options.onNetworkEvent?.({
          type: 'websocket',
          action: 'Message sent',
          status: 'success',
        })
      } catch (error) {
        options.onNetworkEvent?.({
          type: 'websocket',
          action: 'Send failed',
          status: 'error',
          details: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  return {
    connect,
    disconnect,
    send,
  }
}
