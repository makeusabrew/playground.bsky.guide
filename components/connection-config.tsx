'use client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
// import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useJetstreamContext } from '@/app/context/JetstreamContext'

export default function ConnectionConfig() {
  const { status, error, connect, disconnect, config, updateConfig } = useJetstreamContext()
  const isConnected = status === 'connected'

  const connectionStrings = buildConnectionString(config)

  return (
    <>
      {/* Connection Settings */}
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Connection settings</h2>
            <p className="text-sm text-muted-foreground">Status: {status}</p>
          </div>

          {error && <p className="text-sm text-destructive">{error.message}</p>}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Instance</Label>
              <Select value={config.instance} onValueChange={(value) => updateConfig({ instance: value })}>
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
                value={config.collections}
                onChange={(e) => updateConfig({ collections: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Comma-separated list of collections</p>
            </div>

            <div className="space-y-2">
              <Label>Wanted DIDs</Label>
              <Input
                placeholder="did:plc:1234,did:plc:5678"
                value={config.dids}
                onChange={(e) => updateConfig({ dids: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Comma-separated list of DIDs (max 10,000)</p>
            </div>

            <div className="space-y-2">
              <Label>Cursor (microseconds)</Label>
              <Input
                placeholder="1725519626134432"
                value={config.cursor}
                onChange={(e) => updateConfig({ cursor: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Unix timestamp in microseconds to start from</p>
            </div>

            <div className="space-y-2">
              <Label>Message limit</Label>
              <Input
                type="number"
                min="1"
                max="100000"
                placeholder="1000"
                value={config.messageLimit}
                onChange={(e) => updateConfig({ messageLimit: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Maximum number of messages to keep in memory</p>
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
              onClick={isConnected ? disconnect : connect}
              variant={isConnected ? 'secondary' : 'default'}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </div>
      </Card>
    </>
  )
}

function buildConnectionString(config: JetstreamConfig) {
  const params = new URLSearchParams()

  if (config.collections) {
    config.collections.split(',').forEach((c) => params.append('wantedCollections', c.trim()))
  }
  if (config.dids) {
    config.dids.split(',').forEach((d) => params.append('wantedDids', d.trim()))
  }
  if (config.cursor) {
    params.append('cursor', config.cursor)
  }

  const queryString = params.toString()
  const baseUrl = `wss://${config.instance}/subscribe`
  return {
    raw: `${baseUrl}${queryString ? '?' + queryString : ''}`,
    websocat: `websocat '${baseUrl}${queryString ? '\\?' + queryString : ''}'`,
    javascript: `const ws = new WebSocket("${baseUrl}${queryString ? '?' + queryString : ''}")`,
  }
}
