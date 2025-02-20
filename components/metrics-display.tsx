'use client'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Activity } from 'lucide-react'

type JetstreamMetrics = {
  // Totals
  totalMessages: number
  messagesByCollection: Record<string, number>
  totalCreates: number
  totalDeletes: number
  totalNewAccounts: number

  // Rates (per second)
  messagesPerSecond: number
  createPerSecond: number
  deletePerSecond: number
  newAccountsPerSecond: number
  collectionRates: Record<string, number>

  // For rate calculations
  lastUpdate: number
}

function formatNumber(num: number): string {
  if (num === 0) return '0'
  if (num >= 1_000_000_000) {
    const billions = num / 1_000_000_000
    return `${billions >= 100 ? billions.toFixed(1) : billions.toFixed(3)}b`
  }
  if (num >= 1_000_000) {
    const millions = num / 1_000_000
    return `${millions >= 100 ? millions.toFixed(1) : millions.toFixed(3)}m`
  }
  if (num >= 1000) {
    const thousands = num / 1000
    return `${thousands >= 100 ? thousands.toFixed(1) : thousands.toFixed(2)}k`
  }
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

interface StatCardProps {
  label: string
  total: number
  rate: number
}

function StatCard({ label, total, rate }: StatCardProps) {
  return (
    <div className="p-2 rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className={`text-sm font-medium ${getRateColor(rate)}`}>{formatRate(rate)}</div>
      </div>
      <div className="text-2xl font-bold tracking-tight mt-1">{formatNumber(total)}</div>
    </div>
  )
}

export default function MetricsDisplay({ metrics }: { metrics: JetstreamMetrics }) {
  return (
    <div className="p-3">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3 -mx-3 px-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-muted-foreground" />
            <h2 className="font-semibold">Stats</h2>
          </div>
          {metrics.totalMessages > 0 && (
            <Badge variant="outline" className="text-xs">
              Updated: {new Date(metrics.lastUpdate).toLocaleTimeString()}
            </Badge>
          )}
        </div>

        {/* Main stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Total" total={metrics.totalMessages} rate={metrics.messagesPerSecond} />
          <StatCard
            label="Posts"
            total={metrics.messagesByCollection['app.bsky.feed.post'] || 0}
            rate={metrics.collectionRates['app.bsky.feed.post'] || 0}
          />
          <StatCard label="Creates" total={metrics.totalCreates} rate={metrics.createPerSecond} />
          <StatCard label="Deletes" total={metrics.totalDeletes} rate={metrics.deletePerSecond} />
          <StatCard
            label="Likes"
            total={metrics.messagesByCollection['app.bsky.feed.like'] || 0}
            rate={metrics.collectionRates['app.bsky.feed.like'] || 0}
          />
          <StatCard
            label="Follows"
            total={metrics.messagesByCollection['app.bsky.graph.follow'] || 0}
            rate={metrics.collectionRates['app.bsky.graph.follow'] || 0}
          />
          {/* <StatCard label="New users" total={metrics.totalNewAccounts} rate={metrics.newAccountsPerSecond} /> */}
        </div>

        {/* Collections */}
        <div className="space-y-2">
          <h2 className="font-semibold text-sm">By collection</h2>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {Object.entries(metrics.messagesByCollection)
                .filter(([a]) => a.startsWith('app.bsky.'))
                .sort(([, a], [, b]) => b - a)
                .map(([collection, count]) => (
                  <div
                    key={collection}
                    className="flex items-center justify-between py-1.5 px-2 rounded-sm hover:bg-muted/50"
                  >
                    <div className="text-xs font-mono truncate flex-1">{collection}</div>
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
