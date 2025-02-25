import { NetworkEvent, NetworkActivityLog } from '@/components/network-activity-log'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ActivityIcon } from 'lucide-react'
import { useState } from 'react'
import { Badge } from './ui/badge'

interface NetworkActivitySheetProps {
  events: NetworkEvent[]
  maxEvents?: number
}

export function NetworkActivitySheet({ events, maxEvents = 100 }: NetworkActivitySheetProps) {
  const [open, setOpen] = useState(false)
  const recentActivity = events.length > 0

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <ActivityIcon size={16} />
          <span className="hidden sm:inline">Network activity</span>
          {recentActivity && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 px-1 min-w-5 h-5 flex items-center justify-center"
            >
              {events.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[350px] sm:h-[450px] p-0">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle>Network activity</SheetTitle>
          <SheetDescription>Recent WebSocket connections and HTTP requests</SheetDescription>
        </SheetHeader>
        <div className="mt-4 p-0">
          <NetworkActivityLog events={events} maxEvents={maxEvents} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
