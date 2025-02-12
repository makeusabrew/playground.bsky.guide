import { useState, useEffect, useRef } from 'react'
import type { JetstreamEvent, JetstreamMetrics } from '@/lib/playground/jetstream/types'

const RATE_WINDOW = 5000 // 5 second window for rate calculation
const UPDATE_INTERVAL = 1000 // Update rates every second
const DECAY_FACTOR = 0.8 // How quickly rates decay when no new messages arrive

export function useMetrics(messages: JetstreamEvent[]) {
  const [metrics, setMetrics] = useState<JetstreamMetrics>({
    totalMessages: 0,
    messagesByCollection: {},
    totalCreates: 0,
    totalDeletes: 0,
    messagesPerSecond: 0,
    createPerSecond: 0,
    deletePerSecond: 0,
    collectionRates: {},
    lastUpdate: Date.now(),
  })

  // Keep track of recent messages for rate calculations
  const recentMessagesRef = useRef<{ timestamp: number; collection?: string; operation?: string }[]>([])

  // Process new messages
  useEffect(() => {
    if (messages.length === 0) return

    // Get the latest message
    const latestMessage = messages[messages.length - 1]

    // Update totals
    setMetrics((prev) => {
      const newMetrics = { ...prev }
      newMetrics.totalMessages++

      if (latestMessage.kind === 'commit') {
        const collection = latestMessage.commit.collection
        newMetrics.messagesByCollection[collection] = (newMetrics.messagesByCollection[collection] || 0) + 1

        if (latestMessage.commit.operation === 'create') {
          newMetrics.totalCreates++
        } else if (latestMessage.commit.operation === 'delete') {
          newMetrics.totalDeletes++
        }
      }

      // Add to recent messages
      recentMessagesRef.current.push({
        timestamp: Date.now(),
        collection: latestMessage.kind === 'commit' ? latestMessage.commit.collection : undefined,
        operation: latestMessage.kind === 'commit' ? latestMessage.commit.operation : undefined,
      })

      return newMetrics
    })
  }, [messages])

  // Periodically update rates and clean up old messages
  useEffect(() => {
    const updateRates = () => {
      const now = Date.now()
      const cutoff = now - RATE_WINDOW

      // Remove old messages
      recentMessagesRef.current = recentMessagesRef.current.filter((msg) => msg.timestamp > cutoff)

      setMetrics((prev) => {
        const newMetrics = { ...prev }
        const windowSeconds = RATE_WINDOW / 1000

        // If no recent messages, decay the rates
        if (recentMessagesRef.current.length === 0) {
          newMetrics.messagesPerSecond *= DECAY_FACTOR
          newMetrics.createPerSecond *= DECAY_FACTOR
          newMetrics.deletePerSecond *= DECAY_FACTOR
          Object.keys(newMetrics.collectionRates).forEach((collection) => {
            newMetrics.collectionRates[collection] *= DECAY_FACTOR
          })
        } else {
          // Calculate new rates
          newMetrics.messagesPerSecond = recentMessagesRef.current.length / windowSeconds

          // Calculate operation rates
          const recentCreates = recentMessagesRef.current.filter((m) => m.operation === 'create').length
          const recentDeletes = recentMessagesRef.current.filter((m) => m.operation === 'delete').length
          newMetrics.createPerSecond = recentCreates / windowSeconds
          newMetrics.deletePerSecond = recentDeletes / windowSeconds

          // Calculate collection rates
          const collections = new Set(recentMessagesRef.current.map((m) => m.collection).filter(Boolean))
          newMetrics.collectionRates = {}
          collections.forEach((collection) => {
            if (collection) {
              const count = recentMessagesRef.current.filter((m) => m.collection === collection).length
              newMetrics.collectionRates[collection] = count / windowSeconds
            }
          })
        }

        newMetrics.lastUpdate = now
        return newMetrics
      })
    }

    const interval = setInterval(updateRates, UPDATE_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  return metrics
}
