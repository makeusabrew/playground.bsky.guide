import { NetworkEvent, NetworkActivityLog } from '@/components/network-activity-log'
import { Button } from '@/components/ui/button'
import { ActivityIcon, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { cn } from '@/lib/utils'

interface NetworkActivityOverlayProps {
  events: NetworkEvent[]
  maxEvents?: number
}

export function NetworkActivityOverlay({ events, maxEvents = 100 }: NetworkActivityOverlayProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasNewEvents, setHasNewEvents] = useState(false)
  const [eventsCount, setEventsCount] = useState(events.length)

  // Track new events for notification badge
  useEffect(() => {
    if (events.length > eventsCount) {
      setHasNewEvents(true)
    }
    setEventsCount(events.length)
  }, [events.length, eventsCount])

  // Reset new events indicator when opening the overlay
  useEffect(() => {
    if (isOpen) {
      setHasNewEvents(false)
    }
  }, [isOpen])

  return (
    <>
      {/* Trigger button */}
      <div className="fixed bottom-2 right-2 z-40">
        <Button variant="outline" size="sm" className="gap-2 relative shadow-md" onClick={() => setIsOpen(!isOpen)}>
          <ActivityIcon size={16} />
          <span className="hidden sm:inline">Network activity</span>
          {hasNewEvents && !isOpen && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 px-1 min-w-5 h-5 flex items-center justify-center"
            >
              {events.length - eventsCount + 1}
            </Badge>
          )}
        </Button>
      </div>

      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 transition-all duration-300 transform',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Backdrop */}
        <div className="bg-background/80 backdrop-blur-sm fixed inset-0" onClick={() => setIsOpen(false)} />

        {/* Content container */}
        <div className="container mx-auto px-4 relative">
          <Card className="relative mx-auto max-w-7xl h-[350px] sm:h-[450px] border rounded-b-none shadow-lg">
            <div className="absolute right-1.5 top-1.5 z-10">
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            <div className="h-full">
              <NetworkActivityLog events={events} maxEvents={maxEvents} />
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
