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

export default function Home() {
  const showShimmer = useShimmer()
  const { metrics, onMessage } = useMetrics()
  const { hasEverConnected, connectionState, setConnectionState, connectionOptions, setConnectionOptions, messages } =
    useConnection(onMessage)
  const { filters, setFilters, filteredMessages } = useFilters(messages)

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
