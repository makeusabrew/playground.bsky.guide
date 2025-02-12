'use client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { useJetstream } from '@/app/hooks/use-jetstream'

export default function ConnectionConfig() {
  const [instance, setInstance] = useState('jetstream2.us-east.bsky.network')
  const [collections, setCollections] = useState('')
  const [dids, setDids] = useState('')
  const [cursor, setCursor] = useState('')
  const [compression, setCompression] = useState(false)

  const { status, error, connect, disconnect } = useJetstream({
    instance,
    collections,
    dids,
    cursor,
    compression,
  })

  const isConnected = status === 'connected'

  const buildConnectionString = () => {
    const params = new URLSearchParams()

    if (collections) {
      collections.split(',').forEach((c) => params.append('wantedCollections', c.trim()))
    }
    if (dids) {
      dids.split(',').forEach((d) => params.append('wantedDids', d.trim()))
    }
    if (cursor) {
      params.append('cursor', cursor)
    }
    if (compression) {
      params.append('compress', 'true')
    }

    const queryString = params.toString()
    const baseUrl = `wss://${instance}/subscribe`
    return {
      raw: `${baseUrl}${queryString ? '?' + queryString : ''}`,
      websocat: `websocat '${baseUrl}${queryString ? '\\?' + queryString : ''}'`,
      javascript: `const ws = new WebSocket("${baseUrl}${queryString ? '?' + queryString : ''}")`,
    }
  }

  const connectionStrings = buildConnectionString()

  return (
    <>
      <Card className="p-4 mb-4 col-span-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">connection string</h2>
          </div>

          <Tabs defaultValue="raw" className="space-y-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="raw">Raw URL</TabsTrigger>
              <TabsTrigger value="websocat">Websocat</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            </TabsList>

            <TabsContent value="raw" className="space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <pre className="flex-1 text-sm bg-muted p-3 rounded-md overflow-x-auto font-mono whitespace-pre-wrap break-all">
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
                <pre className="flex-1 text-sm bg-muted p-3 rounded-md overflow-x-auto font-mono whitespace-pre-wrap break-all">
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
                <pre className="flex-1 text-sm bg-muted p-3 rounded-md overflow-x-auto font-mono whitespace-pre-wrap break-all">
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
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">connection settings</h2>
            <p className="text-sm text-muted-foreground">Status: {status}</p>
          </div>

          {error && <p className="text-sm text-destructive">{error.message}</p>}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>instance</Label>
              <Select value={instance} onValueChange={setInstance}>
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
              <Label>wanted collections</Label>
              <Input
                placeholder="app.bsky.feed.post,app.bsky.feed.like"
                value={collections}
                onChange={(e) => setCollections(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Comma-separated list of collections</p>
            </div>

            <div className="space-y-2">
              <Label>wanted DIDs</Label>
              <Input placeholder="did:plc:1234,did:plc:5678" value={dids} onChange={(e) => setDids(e.target.value)} />
              <p className="text-xs text-muted-foreground">Comma-separated list of DIDs (max 10,000)</p>
            </div>

            <div className="space-y-2">
              <Label>cursor (microseconds)</Label>
              <Input placeholder="1725519626134432" value={cursor} onChange={(e) => setCursor(e.target.value)} />
              <p className="text-xs text-muted-foreground">Unix timestamp in microseconds to start from</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="compression" checked={compression} onCheckedChange={setCompression} />
              <Label htmlFor="compression">enable compression</Label>
            </div>

            <Button
              className="w-full"
              onClick={isConnected ? disconnect : connect}
              variant={isConnected ? 'secondary' : 'default'}
            >
              {isConnected ? 'disconnect' : 'connect'}
            </Button>
          </div>
        </div>
      </Card>
    </>
  )
}
