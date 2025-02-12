'use client'
import ConnectionConfig from '@/components/connection-config'
import StreamViewer from '@/components/stream-viewer'
import MetricsDisplay from '@/components/metrics-display'
import { JetstreamProvider } from '@/app/context/JetstreamContext'

export default function Home() {
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

            <JetstreamProvider>
              <div className="space-y-6">
                <ConnectionConfig />
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
