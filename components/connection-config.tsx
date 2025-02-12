'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { JetstreamConfig } from '@/types/jetstream'
import { Badge } from '@/components/ui/badge'

interface ConnectionConfigProps {
  isConnected: boolean
  setIsConnected: (isConnected: boolean) => void
  options: JetstreamConfig
  setOptions: (options: JetstreamConfig) => void
}

export default function ConnectionConfig({ isConnected, options, setOptions, setIsConnected }: ConnectionConfigProps) {
  return (
    <div className="p-3">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Connection settings</h2>
          <Badge variant={isConnected ? 'default' : 'secondary'}>{isConnected ? 'Connected' : 'Disconnected'}</Badge>
        </div>

        <div className="space-y-5">
          <div className="space-y-2.5">
            <Label className="text-sm">Instance</Label>
            <Select
              value={options.instance}
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

          <div className="space-y-2.5">
            <Label className="text-sm">Wanted collections</Label>
            <Input
              className="font-mono text-sm"
              placeholder="app.bsky.feed.post,app.bsky.feed.like"
              value={options.collections}
              onChange={(e) =>
                setOptions({
                  ...options,
                  collections: e.target.value,
                })
              }
            />
            <p className="text-xs text-muted-foreground">Comma-separated list of collections</p>
          </div>

          <div className="space-y-2.5">
            <Label className="text-sm">Wanted DIDs</Label>
            <Input
              className="font-mono text-sm"
              placeholder="did:plc:1234,did:plc:5678"
              value={options.dids}
              onChange={(e) =>
                setOptions({
                  ...options,
                  dids: e.target.value,
                })
              }
            />
            <p className="text-xs text-muted-foreground">Comma-separated list of DIDs (max 10,000)</p>
          </div>

          <div className="space-y-2.5">
            <Label className="text-sm">Cursor (microseconds)</Label>
            <Input
              className="font-mono text-sm"
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

          {/* <div className="space-y-2">
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
          </div> */}

          {/* <div className="flex items-center space-x-2">
            <Switch id="compression" checked={compression} onCheckedChange={setCompression} />
            <Label htmlFor="compression">enable compression</Label>
          </div> */}

          <Button
            className="w-full"
            onClick={() => setIsConnected(!isConnected)}
            variant={isConnected ? 'destructive' : 'default'}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </div>
    </div>
  )
}
