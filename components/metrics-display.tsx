'use client'
import { Card } from '@/components/ui/card'
import { JetstreamMetrics } from '@/lib/playground/jetstream/types'

function formatNumber(num: number): string {
  if (num === 0) return '0'
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toFixed(1)
}

function formatRate(rate: number): string {
  return `${formatNumber(rate)}/s`
}

export default function MetricsDisplay({ metrics }: { metrics: JetstreamMetrics }) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h2 className="font-semibold">Metrics</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total metrics */}
          <div className="space-y-1">
            <div className="text-sm font-medium">Total messages</div>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalMessages)}</div>
            <div className="text-sm text-muted-foreground">{formatRate(metrics.messagesPerSecond)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">Creates</div>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalCreates)}</div>
            <div className="text-sm text-muted-foreground">{formatRate(metrics.createPerSecond)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">Deletes</div>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalDeletes)}</div>
            <div className="text-sm text-muted-foreground">{formatRate(metrics.deletePerSecond)}</div>
          </div>
        </div>

        {/* Collection metrics */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Collections</h3>
          <div className="space-y-2">
            {Object.entries(metrics.messagesByCollection)
              .sort(([, a], [, b]) => b - a)
              .map(([collection, count]) => (
                <div key={collection} className="flex items-center justify-between">
                  <div className="text-sm font-mono truncate flex-1">{collection}</div>
                  <div className="text-sm tabular-nums">
                    {formatNumber(count)}
                    <span className="text-muted-foreground ml-2">
                      ({formatRate(metrics.collectionRates[collection] || 0)})
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
