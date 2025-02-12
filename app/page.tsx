'use client'
import { useEffect, useState } from 'react'
import ConnectionConfig from '@/components/connection-config'
import StreamViewer from '@/components/stream-viewer'
import MetricsDisplay from '@/components/metrics-display'
import { JetstreamConfig } from '@/types/jetstream'
import { useJetstream } from './hooks/use-jetstream'
import { JetstreamMetrics } from '@/lib/playground/jetstream/types'
import { ConnectionString } from '@/components/connection-string'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionOptions, setConnectionOptions] = useState<JetstreamConfig>({
    // Default options here
    instance: 'jetstream1.us-east.bsky.network',
    collections: '',
    dids: '',
    cursor: undefined,
    messageLimit: '1000',
  })

  const jetstream = useJetstream(connectionOptions)

  useEffect(() => {
    if (isConnected) {
      jetstream.connect()
    } else {
      jetstream.disconnect()
    }
  }, [isConnected])

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

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2">
                <ConnectionConfig
                  isConnected={isConnected}
                  options={connectionOptions}
                  setOptions={setConnectionOptions}
                  setIsConnected={setIsConnected}
                />
              </div>
              <div className="md:col-span-3 space-y-6">
                <ConnectionString options={connectionOptions} />
                <MetricsDisplay metrics={metrics} />
              </div>
            </div>

            <div className="space-y-6">
              <StreamViewer messages={jetstream.messages} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
