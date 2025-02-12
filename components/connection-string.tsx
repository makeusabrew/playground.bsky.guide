import { Button } from './ui/button'
import { Card } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { JetstreamConfig } from '@/types/jetstream'

export function ConnectionString({ options }: { options: JetstreamConfig }) {
  const connectionStrings = buildConnectionString(options)
  return (
    <Card className="p-4 space-y-4">
      <h2 className="font-semibold">Connection string</h2>

      <Tabs defaultValue="raw" className="space-y-2">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="raw">Raw URL</TabsTrigger>
          <TabsTrigger value="websocat">Websocat</TabsTrigger>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
        </TabsList>

        <TabsContent value="raw" className="space-y-2">
          <div className="flex items-center justify-between space-x-2">
            <pre className="flex-1 text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono">
              <code>{connectionStrings.raw}</code>
            </pre>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(connectionStrings.raw)}>
              copy
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="websocat" className="space-y-2">
          <div className="flex items-center justify-between space-x-2">
            <pre className="flex-1 text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono">
              <code>{connectionStrings.websocat}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(connectionStrings.websocat)}
            >
              copy
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="javascript" className="space-y-2">
          <div className="flex items-center justify-between space-x-2">
            <pre className="flex-1 text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono">
              <code>{connectionStrings.javascript}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(connectionStrings.javascript)}
            >
              copy
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

function buildConnectionString(options: JetstreamConfig) {
  const params = new URLSearchParams()

  if (options.collections) {
    options.collections.split(',').forEach((c) => params.append('wantedCollections', c))
  }
  if (options.dids) {
    options.dids.split(',').forEach((d) => params.append('wantedDids', d))
  }
  if (options.cursor) {
    params.append('cursor', options.cursor)
  }
  // if (options.maxMessageSizeBytes > 0) {
  //   params.append('maxMessageSizeBytes', options.maxMessageSizeBytes.toString())
  // }
  // if (options.compress) {
  //   params.append('compress', 'true')
  // }
  // if (options.requireHello) {
  //   params.append('requireHello', 'true')
  // }

  const queryString = params.toString()
  const baseUrl = 'wss://jetstream1.us-east.bsky.network/subscribe'
  return {
    raw: `${baseUrl}${queryString ? '?' + queryString : ''}`,
    websocat: `websocat '${baseUrl}${queryString ? '\\?' + queryString : ''}'`,
    javascript: `const ws = new WebSocket("${baseUrl}${queryString ? '?' + queryString : ''}")`,
  }
}
