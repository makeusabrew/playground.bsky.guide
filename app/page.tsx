import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ConnectionConfig from '@/components/connection-config'
import StreamViewer from '@/components/stream-viewer'
import MetricsDisplay from '@/components/metrics-display'

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

            <Tabs defaultValue="stream" className="space-y-4">
              <TabsList>
                <TabsTrigger value="stream">Stream viewer</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="stream" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[400px_1fr]">
                  <ConnectionConfig />
                  <StreamViewer />
                </div>
              </TabsContent>

              <TabsContent value="metrics">
                <MetricsDisplay />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
