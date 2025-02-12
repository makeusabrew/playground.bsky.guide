'use client'
import { JetstreamMetrics } from '@/lib/playground/jetstream/types'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'

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
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Real-time metrics</h2>
          {metrics.totalMessages > 0 && (
            <Badge variant="outline" className="text-xs">
              Last update: {new Date(metrics.lastUpdate).toLocaleTimeString()}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="text-sm font-medium text-muted-foreground">Total messages</div>
            <div className="text-3xl font-bold tracking-tight">{formatNumber(metrics.totalMessages)}</div>
            <div className={`text-sm ${getRateColor(metrics.messagesPerSecond)}`}>
              {formatRate(metrics.messagesPerSecond)}
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="text-sm font-medium text-muted-foreground">Creates</div>
            <div className="text-3xl font-bold tracking-tight">{formatNumber(metrics.totalCreates)}</div>
            <div className={`text-sm ${getRateColor(metrics.createPerSecond)}`}>
              {formatRate(metrics.createPerSecond)}
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="text-sm font-medium text-muted-foreground">Deletes</div>
            <div className="text-3xl font-bold tracking-tight">{formatNumber(metrics.totalDeletes)}</div>
            <div className={`text-sm ${getRateColor(metrics.deletePerSecond)}`}>
              {formatRate(metrics.deletePerSecond)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-sm">Collections</h2>
          <ScrollArea className="h-[200px]">
            <div className="space-y-0">
              {Object.entries(metrics.messagesByCollection)
                .sort(([, a], [, b]) => b - a)
                .map(([collection, count]) => (
                  <div
                    key={collection}
                    className="flex items-center justify-between py-2 px-1.5 rounded-sm hover:bg-muted/50"
                  >
                    <div className="text-sm font-mono truncate flex-1">{collection}</div>
                    <div className="text-sm tabular-nums flex items-center gap-3">
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
