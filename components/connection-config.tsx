'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { JetstreamConfig } from '@/types/jetstream'
import { Badge } from '@/components/ui/badge'
import { PauseCircle, PlayCircle, RotateCcw } from 'lucide-react'
import { ConnectionState } from '@/app/page'

interface ConnectionConfigProps {
  hasEverConnected: boolean
  connectionState: ConnectionState
  setConnectionState: (connectionState: ConnectionState) => void
  options: JetstreamConfig
  setOptions: (options: JetstreamConfig) => void
}

export default function ConnectionConfig({
  hasEverConnected,
  connectionState,
  setConnectionState,
  options,
  setOptions,
}: ConnectionConfigProps) {
  const isConnected = connectionState.connected
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

          {isConnected ? (
            <Button
              className="w-full flex items-center gap-2"
              onClick={() => setConnectionState({ connected: false, mode: 'restart' })}
              variant="secondary"
            >
              <PauseCircle className="w-4 h-4" />
              Disconnect
            </Button>
          ) : (
            <>
              {hasEverConnected ? (
                <div className="gap-2 flex">
                  <Button
                    className="w-full flex items-center gap-2"
                    onClick={() => setConnectionState({ connected: true, mode: 'resume' })}
                    variant="outline"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Resume
                  </Button>
                  <Button
                    className="w-full flex items-center gap-2"
                    onClick={() => setConnectionState({ connected: true, mode: 'restart' })}
                    variant="secondary"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restart
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full flex items-center gap-2"
                  onClick={() => setConnectionState({ connected: true, mode: 'restart' })}
                  variant="default"
                >
                  <PlayCircle className="w-4 h-4" />
                  Connect
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
