'use client'
import { JetstreamMetrics } from '@/lib/playground/jetstream/types'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Activity } from 'lucide-react'
function formatNumber(num: number): string {
  if (num === 0) return '0'
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toFixed(0)
}

function formatRate(rate: number): string {
  return `${formatNumber(rate)}/s`
}

// Helper to determine color based on rate
function getRateColor(rate: number): string {
  if (rate > 200) return 'text-green-500 dark:text-green-400'
  if (rate > 50) return 'text-blue-500 dark:text-blue-400'
  return 'text-muted-foreground'
}

export default function MetricsDisplay({ metrics }: { metrics: JetstreamMetrics }) {
  return (
    <div className="p-3">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3 -mx-3 px-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-muted-foreground" />
            <h2 className="font-semibold">Metrics</h2>
          </div>
          {metrics.totalMessages > 0 && (
            <Badge variant="outline" className="text-xs">
              Last update: {new Date(metrics.lastUpdate).toLocaleTimeString()}
            </Badge>
          )}
        </div>

        {/* Main stats - now in a vertical layout */}
        <div className="space-y-2">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Messages</div>
              <div className={`text-sm font-medium ${getRateColor(metrics.messagesPerSecond)}`}>
                {formatRate(metrics.messagesPerSecond)}
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight mt-1">{formatNumber(metrics.totalMessages)}</div>
          </div>

          <div className="p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Creates</div>
              <div className={`text-sm font-medium ${getRateColor(metrics.createPerSecond)}`}>
                {formatRate(metrics.createPerSecond)}
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight mt-1">{formatNumber(metrics.totalCreates)}</div>
          </div>

          <div className="p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Deletes</div>
              <div className={`text-sm font-medium ${getRateColor(metrics.deletePerSecond)}`}>
                {formatRate(metrics.deletePerSecond)}
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight mt-1">{formatNumber(metrics.totalDeletes)}</div>
          </div>
        </div>

        {/* Collections - now more compact */}
        <div className="space-y-2">
          <h2 className="font-semibold text-sm">Collections</h2>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {Object.entries(metrics.messagesByCollection)
                .sort(([, a], [, b]) => b - a)
                .map(([collection, count]) => (
                  <div
                    key={collection}
                    className="flex items-center justify-between py-1.5 px-2 rounded-sm hover:bg-muted/50"
                  >
                    <div className="text-xs font-mono truncate flex-1">{collection.split('.').pop()}</div>
                    <div className="text-xs tabular-nums flex items-center gap-2">
                      <span className="font-medium">{formatNumber(count)}</span>
                      <span className={`${getRateColor(metrics.collectionRates[collection] || 0)}`}>
                        {formatRate(metrics.collectionRates[collection] || 0)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
