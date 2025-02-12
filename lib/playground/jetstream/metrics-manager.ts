import type { JetstreamEvent, JetstreamMetrics } from './types'

export type MetricsManager = {
  updateMetrics: (event: JetstreamEvent) => void
  getMetrics: () => JetstreamMetrics
  reset: () => void
}

export const createMetricsManager = (onMetricsUpdate?: (metrics: JetstreamMetrics) => void): MetricsManager => {
  const RATE_WINDOW = 5000 // 5 second window for rate calculation

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

  let recentMessages: { timestamp: number; collection?: string; operation?: string }[] = []

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
    onMetricsUpdate?.({ ...metrics })
  }

  const reset = () => {
    recentMessages = []
    metrics = {
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
    onMetricsUpdate?.({ ...metrics })
  }

  return {
    updateMetrics,
    getMetrics: () => ({ ...metrics }),
    reset,
  }
}
