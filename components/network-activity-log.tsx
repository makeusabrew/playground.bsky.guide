import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type NetworkEvent = {
  id: string
  timestamp: number
  type: 'websocket' | 'http'
  action: string
  details?: string
  status?: 'success' | 'error' | 'pending'
  url?: string
}

interface NetworkActivityLogProps {
  events: NetworkEvent[]
  maxEvents?: number
}

export function NetworkActivityLog({ events, maxEvents = 100 }: NetworkActivityLogProps) {
  // Take only the most recent events up to maxEvents
  const displayEvents = events.slice(-maxEvents)

  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Network activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[250px] px-3">
          {displayEvents.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No network activity yet
            </div>
          ) : (
            <div className="space-y-2 pb-3">
              {displayEvents.map((event) => (
                <div key={event.id} className="text-xs border rounded-md p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={event.type === 'websocket' ? 'secondary' : 'outline'}
                        className="text-[10px] px-1 py-0 h-4"
                      >
                        {event.type}
                      </Badge>
                      <span className="font-medium">{event.action}</span>
                    </div>
                    <span className="text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {event.url && (
                    <div className="text-muted-foreground truncate" title={event.url}>
                      {event.url}
                    </div>
                  )}
                  {event.details && <div className="text-muted-foreground mt-1">{event.details}</div>}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </>
  )
}
