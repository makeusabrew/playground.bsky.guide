import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ChevronDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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
  const displayEvents = events.slice(-maxEvents).reverse() // Reverse to show newest at top

  const getStatusColor = (status?: string) => {
    if (!status) return ''
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'pending':
        return 'text-amber-600'
      default:
        return ''
    }
  }

  return (
    <>
      <CardHeader className="p-3 border-b">
        <div className="flex items-center gap-2">
          <Activity size={16} />
          <CardTitle className="text-base p-0">Network activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-60px)]">
        <ScrollArea className="h-full mt-3">
          {displayEvents.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No network activity yet
            </div>
          ) : (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <div className="flex items-center gap-1">
                        Time
                        <ChevronDown size={12} />
                      </div>
                    </TableHead>
                    <TableHead className="w-[80px]">Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="hidden md:table-cell">URL/Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayEvents.map((event) => (
                    <TableRow key={event.id} className={getStatusColor(event.status)}>
                      <TableCell className="text-xs py-2 whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-xs py-2">
                        <Badge
                          variant={event.type === 'websocket' ? 'secondary' : 'outline'}
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          {event.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs py-2 font-medium">
                        {event.action}
                        {/* Show URL/details on mobile as a second line */}
                        {(event.url || event.details) && (
                          <div className="text-muted-foreground truncate md:hidden text-[10px] mt-1">
                            {event.url || event.details}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs py-2 text-muted-foreground truncate hidden md:table-cell">
                        {event.url || event.details || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </>
  )
}
