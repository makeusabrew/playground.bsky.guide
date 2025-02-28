type NetworkEventHandler = (event: {
  type: 'http'
  action: string
  details?: string
  status?: 'success' | 'error' | 'pending'
  url: string
}) => string | void

/**
 * Creates a wrapped fetch function that tracks network activity
 */
export function createTrackedFetch(onNetworkEvent?: NetworkEventHandler) {
  return async function trackedFetch(url: string | URL | Request, options?: RequestInit): Promise<Response> {
    const urlString = url instanceof Request ? url.url : url.toString()
    const method = options?.method || (url instanceof Request ? url.method : 'GET')

    // Log request start
    onNetworkEvent?.({
      type: 'http',
      action: `${method} Request`,
      status: 'pending',
      url: urlString,
    })

    try {
      const response = await fetch(url, options)

      // Log request completion
      onNetworkEvent?.({
        type: 'http',
        action: `${method} ${response.status}`,
        status: response.ok ? 'success' : 'error',
        details: response.statusText,
        url: urlString,
      })

      return response
    } catch (error) {
      // Log request error
      onNetworkEvent?.({
        type: 'http',
        action: `${method} Failed`,
        status: 'error',
        details: error instanceof Error ? error.message : 'Unknown error',
        url: urlString,
      })

      throw error
    }
  }
}
