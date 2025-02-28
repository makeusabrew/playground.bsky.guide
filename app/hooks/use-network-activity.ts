import { useState, useCallback } from 'react'
import { NetworkEvent } from '@/components/network-activity-log'

export function useNetworkActivity(maxEvents = 100) {
  const [events, setEvents] = useState<NetworkEvent[]>([])

  const addEvent = useCallback(
    (event: Omit<NetworkEvent, 'id' | 'timestamp'>) => {
      const newEvent: NetworkEvent = {
        ...event,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }
      setEvents((prev) => {
        const updated = [...prev, newEvent]
        return updated.slice(-maxEvents)
      })
      return newEvent.id
    },
    [maxEvents]
  )

  const updateEvent = useCallback((id: string, updates: Partial<NetworkEvent>) => {
    setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, ...updates } : event)))
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return {
    events,
    addEvent,
    updateEvent,
    clearEvents,
  }
}
