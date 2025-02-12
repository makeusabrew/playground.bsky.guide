import { Button } from './ui/button'
import { Card } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { JetstreamConfig } from '@/types/jetstream'

export function ConnectionString({ options }: { options: JetstreamConfig }) {
  const connectionStrings = buildConnectionString(options)

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="font-semibold">Connection string</h2>

        <Tabs defaultValue="raw" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="raw">Raw URL</TabsTrigger>
            <TabsTrigger value="websocat">Websocat</TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          </TabsList>

          {['raw', 'websocat', 'javascript'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-2">
              <div className="relative">
                <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto font-mono">
                  <code>{connectionStrings[tab as keyof typeof connectionStrings]}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    navigator.clipboard.writeText(connectionStrings[tab as keyof typeof connectionStrings])
                  }
                >
                  Copy
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
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
