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
import ConnectionControls from '@/components/connection-controls'

export type ConnectionState = {
  connected: boolean
  mode: 'resume' | 'restart'
}

export default function Home() {
  const [hasEverConnected, setHasEverConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    connected: false,
    mode: 'restart',
  })
  const [showShimmer, setShowShimmer] = useState(true)
  const [connectionOptions, setConnectionOptions] = useState<JetstreamConfig>({
    // Default options here
    instance: 'jetstream1.us-east.bsky.network',
    collections: '',
    dids: '',
    cursor: undefined,
    messageLimit: '1000',
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
    if (connectionState.connected) {
      if (connectionState.mode === 'restart') {
        jetstream.connect()
      } else {
        jetstream.resume()
      }
      setShowShimmer(false)
      setHasEverConnected(true)
    } else {
      jetstream.disconnect()
    }
  }, [connectionState])

  // Remove shimmer after 5 seconds if user hasn't connected
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowShimmer(false)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

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
    <main className="flex-1">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="space-y-4">
          {/* <div className="flex items-center gap-2">
            <div className="text-sm">Explore the Jetstream firehose and Bluesky HTTP APIs</div>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3 space-y-3">
              <Card className={`${showShimmer ? 'animate-shimmer' : ''}`}>
                <ConnectionConfig
                  connectionState={connectionState}
                  options={connectionOptions}
                  setOptions={setConnectionOptions}
                />
                <ConnectionString options={connectionOptions} />
                <ConnectionControls
                  hasEverConnected={hasEverConnected}
                  connectionState={connectionState}
                  setConnectionState={setConnectionState}
                />
              </Card>
            </div>
            <div className="md:col-span-6">
              <StreamViewer messages={jetstream.messages} filteredMessages={filteredMessages} />
            </div>
            <div className="md:col-span-3 space-y-3">
              <Card>
                <LiveFilters filters={filters} onFiltersChange={setFilters} disabled={!connectionState.connected} />
              </Card>
              <Card>
                <MetricsDisplay metrics={metrics} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
