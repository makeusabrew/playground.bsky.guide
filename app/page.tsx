'use client'
import { useEffect, useState } from 'react'
import ConnectionConfig from '@/components/connection-config'
import StreamViewer from '@/components/stream-viewer'
import MetricsDisplay from '@/components/metrics-display'
import { JetstreamConfig } from '@/types/jetstream'
import { useJetstream } from './hooks/use-jetstream'
import { JetstreamMetrics } from '@/lib/playground/jetstream/types'
import { ConnectionString } from '@/components/connection-string'
import { Card } from '@/components/ui/card'
import LiveFilters, { FilterOptions, COMMON_COLLECTIONS } from '@/components/live-filters'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionOptions, setConnectionOptions] = useState<JetstreamConfig>({
    // Default options here
    instance: 'jetstream1.us-east.bsky.network',
    collections: '',
    dids: '',
    cursor: undefined,
    messageLimit: '10000',
  })

  const [filters, setFilters] = useState<FilterOptions>({
    showCreates: true,
    showUpdates: true,
    showDeletes: true,
    showIdentity: true,
    showAccount: true,
    selectedCollections: Object.keys(COMMON_COLLECTIONS),
    didFilter: '',
  })

  const jetstream = useJetstream(connectionOptions)

  useEffect(() => {
    if (isConnected) {
      jetstream.connect()
    } else {
      jetstream.disconnect()
    }
  }, [isConnected])

  // Apply filters to messages
  const filteredMessages = jetstream.messages.filter((msg) => {
    // Filter by event kind
    if (msg.kind === 'identity' && !filters.showIdentity) return false
    if (msg.kind === 'account' && !filters.showAccount) return false
    if (msg.kind === 'commit') {
      // Filter by operation type
      if (msg.commit.operation === 'create' && !filters.showCreates) return false
      if (msg.commit.operation === 'update' && !filters.showUpdates) return false
      if (msg.commit.operation === 'delete' && !filters.showDeletes) return false

      // Filter by collection
      if (!filters.selectedCollections.includes(msg.commit.collection)) {
        return false
      }
    }

    // Filter by DID
    if (filters.didFilter && !msg.did.toLowerCase().includes(filters.didFilter.toLowerCase())) {
      return false
    }

    return true
  })

  // FIXME: need to build a new object otherwise the metrics display doesn't re-render
  const metrics: JetstreamMetrics = {
    totalMessages: jetstream.metrics.totalMessages,
    messagesPerSecond: jetstream.metrics.messagesPerSecond,
    totalCreates: jetstream.metrics.totalCreates,
    createPerSecond: jetstream.metrics.createPerSecond,
    totalDeletes: jetstream.metrics.totalDeletes,
    deletePerSecond: jetstream.metrics.deletePerSecond,
    messagesByCollection: jetstream.metrics.messagesByCollection,
    collectionRates: jetstream.metrics.collectionRates,
    lastUpdate: jetstream.metrics.lastUpdate,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Bluesky Jetstream playground</h1>
              <p className="text-muted-foreground">
                Explore and experiment with the Bluesky Jetstream Firehose and HTTP APIs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="md:col-span-1">
                <ConnectionConfig
                  isConnected={isConnected}
                  options={connectionOptions}
                  setOptions={setConnectionOptions}
                  setIsConnected={setIsConnected}
                />
              </Card>
              <Card className="md:col-span-1">
                <ConnectionString options={connectionOptions} />
                <LiveFilters filters={filters} onFiltersChange={setFilters} />
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card className="md:col-span-2">
                <MetricsDisplay metrics={metrics} />
              </Card>
              <Card className="md:col-span-3">
                <StreamViewer messages={filteredMessages} />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
