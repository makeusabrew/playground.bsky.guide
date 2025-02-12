'use client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ConnectionOptions } from '@/types/jetstream'

interface ConnectionConfigProps {
  isConnected: boolean
  setIsConnected: (isConnected: boolean) => void
  options: ConnectionOptions
  setOptions: (options: ConnectionOptions) => void
}

export default function ConnectionConfig({ isConnected, options, setOptions, setIsConnected }: ConnectionConfigProps) {
  const connectionStrings = buildConnectionString(options)

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Connection settings</h2>
          <p className="text-sm text-muted-foreground">Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Instance</Label>
            <Select
              value="jetstream1.us-east.bsky.network"
              onValueChange={(value) => {
                setOptions({
                  ...options,
                  instance: value,
                })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jetstream1.us-east.bsky.network">US-East 1</SelectItem>
                <SelectItem value="jetstream2.us-east.bsky.network">US-East 2</SelectItem>
                <SelectItem value="jetstream1.us-west.bsky.network">US-West 1</SelectItem>
                <SelectItem value="jetstream2.us-west.bsky.network">US-West 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Wanted collections</Label>
            <Input
              placeholder="app.bsky.feed.post,app.bsky.feed.like"
              value={options.wantedCollections.join(',')}
              onChange={(e) =>
                setOptions({
                  ...options,
                  wantedCollections: e.target.value
                    .split(',')
                    .map((c) => c.trim())
                    .filter(Boolean),
                })
              }
            />
            <p className="text-xs text-muted-foreground">Comma-separated list of collections</p>
          </div>

          <div className="space-y-2">
            <Label>Wanted DIDs</Label>
            <Input
              placeholder="did:plc:1234,did:plc:5678"
              value={options.wantedDids.join(',')}
              onChange={(e) =>
                setOptions({
                  ...options,
                  wantedDids: e.target.value
                    .split(',')
                    .map((d) => d.trim())
                    .filter(Boolean),
                })
              }
            />
            <p className="text-xs text-muted-foreground">Comma-separated list of DIDs (max 10,000)</p>
          </div>

          <div className="space-y-2">
            <Label>Cursor (microseconds)</Label>
            <Input
              placeholder="1725519626134432"
              value={options.cursor || ''}
              onChange={(e) =>
                setOptions({
                  ...options,
                  cursor: e.target.value || undefined,
                })
              }
            />
            <p className="text-xs text-muted-foreground">Unix timestamp in microseconds to start from</p>
          </div>

          <div className="space-y-2">
            <Label>Message size limit (bytes)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={options.maxMessageSizeBytes}
              onChange={(e) =>
                setOptions({
                  ...options,
                  maxMessageSizeBytes: parseInt(e.target.value) || 0,
                })
              }
            />
            <p className="text-xs text-muted-foreground">Maximum message size (0 = no limit)</p>
          </div>

          {/* <div className="flex items-center space-x-2">
            <Switch id="compression" checked={compression} onCheckedChange={setCompression} />
            <Label htmlFor="compression">enable compression</Label>
          </div> */}

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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(connectionStrings.raw)}
                >
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

          <Button
            className="w-full"
            onClick={() => setIsConnected(!isConnected)}
            variant={isConnected ? 'secondary' : 'default'}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function buildConnectionString(options: ConnectionOptions) {
  const params = new URLSearchParams()

  if (options.wantedCollections.length > 0) {
    options.wantedCollections.forEach((c) => params.append('wantedCollections', c))
  }
  if (options.wantedDids.length > 0) {
    options.wantedDids.forEach((d) => params.append('wantedDids', d))
  }
  if (options.cursor) {
    params.append('cursor', options.cursor)
  }
  if (options.maxMessageSizeBytes > 0) {
    params.append('maxMessageSizeBytes', options.maxMessageSizeBytes.toString())
  }
  if (options.compress) {
    params.append('compress', 'true')
  }
  if (options.requireHello) {
    params.append('requireHello', 'true')
  }

  const queryString = params.toString()
  const baseUrl = 'wss://jetstream1.us-east.bsky.network/subscribe'
  return {
    raw: `${baseUrl}${queryString ? '?' + queryString : ''}`,
    websocat: `websocat '${baseUrl}${queryString ? '\\?' + queryString : ''}'`,
    javascript: `const ws = new WebSocket("${baseUrl}${queryString ? '?' + queryString : ''}")`,
  }
}
