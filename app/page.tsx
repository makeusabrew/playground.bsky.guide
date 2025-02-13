'use client'
import ConnectionConfig from '@/components/connection-config'
import StreamViewer from '@/components/stream-viewer'
import MetricsDisplay from '@/components/metrics-display'
import { ConnectionString } from '@/components/connection-string'
import { Card } from '@/components/ui/card'
import LiveFilters from '@/components/live-filters'
import ConnectionControls from '@/components/connection-controls'
import { useMetrics } from './hooks/use-metrics'
import { useShimmer } from './hooks/use-shimmer'
import { useConnection } from './hooks/use-connection'
import { useFilters } from './hooks/use-filters'
import { useJetstream } from './hooks/use-jetstream'
import { useEffect, useState } from 'react'

export default function Home() {
  const showShimmer = useShimmer()
  const { metrics, onMessage } = useMetrics()
  const [hasEverConnected, setHasEverConnected] = useState(false)
  const { connectionState, setConnectionState, connectionOptions, setConnectionOptions } = useConnection()
  const jetstream = useJetstream({ ...connectionOptions, onMessage })
  const messages = jetstream.messages
  const { filters, setFilters, filteredMessages } = useFilters(messages)

  // Handle connection state changes
  useEffect(() => {
    if (connectionState.connected) {
      if (connectionState.mode === 'restart') {
        jetstream.connect()
      } else {
        jetstream.resume()
      }
      setHasEverConnected(true)
    } else {
      jetstream.disconnect()
    }
  }, [connectionState])

  return (
    <main className="flex-1">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="space-y-4">
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
                <div>
                  <div className="border-t p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        <a
                          href="https://github.com/bluesky-social/jetstream"
                          className="underline hover:text-foreground"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Jetstream
                        </a>{' '}
                        is a Bluesky-operated WebSocket service that streams the Bluesky firehose as friendly JSON
                        messages.
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This playground is a community-maintained (by{' '}
                      <a
                        href="https://bsky.app/profile/makeusabrew.bsky.social"
                        className="underline hover:text-foreground"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        me
                      </a>
                      ) tool which lets you connect to and explore the Jetstream service directly from your browser.
                    </div>
                    <div className="text-sm text-muted-foreground">
                      It&rsquo;s brand new, and I&rsquo;d love your feedback.
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <div className="md:col-span-6">
              <StreamViewer messages={messages} filteredMessages={filteredMessages} />
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
