'use client'
import ConnectionConfig from '@/components/connection-config'
import StreamViewer from '@/components/stream-viewer'
import { JetstreamProvider } from '@/app/context/JetstreamContext'
import { useState } from 'react'

export default function Home() {
  const [config, setConfig] = useState({
    instance: 'jetstream2.us-east.bsky.network',
    collections: '',
    dids: '',
    cursor: '',
    compression: false,
    messageLimit: '10000',
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

            <JetstreamProvider {...config}>
              <div className="space-y-6">
                <ConnectionConfig />
                <StreamViewer />
              </div>
            </JetstreamProvider>
          </div>
        </div>
      </main>
    </div>
  )
}
