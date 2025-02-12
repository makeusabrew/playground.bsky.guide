'use client'
import { useState } from 'react'
import ConnectionConfig from '@/components/connection-config'
import StreamViewer from '@/components/stream-viewer'
import MetricsDisplay from '@/components/metrics-display'
import { JetstreamProvider } from '@/app/context/JetstreamContext'
import type { ConnectionOptions } from '@/types/jetstream' // You'll need to create this type

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionOptions, setConnectionOptions] = useState<ConnectionOptions>({
    // Default options here
    instance: 'jetstream1.us-east.bsky.network',
    wantedCollections: [],
    wantedDids: [],
    maxMessageSizeBytes: 0,
    cursor: undefined,
    compress: false,
    requireHello: false,
  })

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

            <ConnectionConfig
              isConnected={isConnected}
              options={connectionOptions}
              setOptions={setConnectionOptions}
              setIsConnected={setIsConnected}
            />

            <JetstreamProvider options={connectionOptions} isConnected={isConnected}>
              <div className="space-y-6">
                <MetricsDisplay />
                <StreamViewer />
              </div>
            </JetstreamProvider>
          </div>
        </div>
      </main>
    </div>
  )
}
