'use client'
import ConnectionConfig from '@/components/connection-config'
import StreamViewer from '@/components/stream-viewer'
import { ConnectionString } from '@/components/connection-string'
import { Card } from '@/components/ui/card'
import { NetworkActivityOverlay } from '@/components/network-activity-overlay'
import { SidebarTabs } from '@/components/sidebar-tabs'
import { useMetrics } from './hooks/use-metrics'
/* import { useShimmer } from './hooks/use-shimmer' */
import { useConnection } from './hooks/use-connection'
import { useFilters } from './hooks/use-filters'
import { useJetstream } from './hooks/use-jetstream'
import { useNetworkActivity } from './hooks/use-network-activity'
import { useEffect, useState } from 'react'

export default function Home() {
  // const showShimmer = useShimmer()
  const { metrics, onMessage } = useMetrics()
  const [hasEverConnected, setHasEverConnected] = useState(false)
  const { connectionState, setConnectionState, connectionOptions, setConnectionOptions } = useConnection()
  const { events: networkEvents, addEvent: addNetworkEvent } = useNetworkActivity(100)
  const jetstream = useJetstream({
    ...connectionOptions,
    onMessage,
    onNetworkEvent: (event) => addNetworkEvent(event),
  })
  const messages = jetstream.messages
  const { filters, setFilters, propertyFilters, setPropertyFilters, filteredMessages } = useFilters(messages)

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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-3 space-y-5">
              <Card className="hidden md:block">
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">
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
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    This playground is a community-maintained tool by{' '}
                    <a
                      href="https://bsky.app/profile/makeusabrew.bsky.social"
                      className="underline hover:text-foreground"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      me
                    </a>{' '}
                    which lets you connect to and explore the Jetstream service directly from your browser. It&rsquo;s
                    brand new, and I&rsquo;d love your feedback.
                  </div>
                </div>
              </Card>

              <Card>
                <ConnectionConfig
                  connectionState={connectionState}
                  options={connectionOptions}
                  setOptions={setConnectionOptions}
                  hasEverConnected={hasEverConnected}
                  setConnectionState={setConnectionState}
                />
                <div className="border-t">
                  <div className="p-3">
                    <ConnectionString options={connectionOptions} />
                  </div>
                </div>
              </Card>
            </div>
            <div className="md:col-span-6">
              <StreamViewer messages={messages} filteredMessages={filteredMessages} />
            </div>
            <div className="md:col-span-3">
              <SidebarTabs
                filters={filters}
                onFiltersChange={setFilters}
                propertyFilters={propertyFilters}
                onPropertyFiltersChange={setPropertyFilters}
                metrics={metrics}
                disabled={!connectionState.connected}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Network activity overlay */}
      <NetworkActivityOverlay events={networkEvents} />
    </main>
  )
}
