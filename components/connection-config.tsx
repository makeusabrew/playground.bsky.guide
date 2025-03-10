'use client'
import { ConnectionState } from '@/app/hooks/use-connection'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { JetstreamConfig } from '@/types/jetstream'
import { ChevronDown, ChevronUp, Info, Settings, PauseCircle, PlayCircle, RotateCcw } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ConnectionConfigProps {
  connectionState: ConnectionState
  options: JetstreamConfig
  setOptions: (options: JetstreamConfig) => void
  hasEverConnected: boolean
  setConnectionState: (connectionState: ConnectionState) => void
}

export default function ConnectionConfig({
  options,
  setOptions,
  connectionState,
  hasEverConnected,
  setConnectionState,
}: ConnectionConfigProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const isConnected = connectionState.connected

  return (
    <TooltipProvider>
      <div className="p-3">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3 -mx-3 px-3">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-muted-foreground hidden md:block" />
              <h2 className="font-semibold">Jetstream connection settings</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 shrink-0">
                <Label className="text-sm">Instance</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={14} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Choose which Jetstream server to connect to</p>
                  </TooltipContent>
                </Tooltip>
              </div>
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

            <div className="flex items-center justify-between gap-2 border-b pb-3 -mx-3 px-3">
              {isConnected ? (
                <Button
                  className="w-full flex items-center gap-2"
                  onClick={() => setConnectionState({ connected: false, mode: 'restart' })}
                >
                  <PauseCircle className="w-4 h-4" />
                  Pause
                </Button>
              ) : (
                <>
                  {hasEverConnected ? (
                    <>
                      <Button
                        className="w-full flex items-center gap-2"
                        onClick={() => setConnectionState({ connected: true, mode: 'resume' })}
                      >
                        <PlayCircle className="w-4 h-4" />
                        Resume
                      </Button>
                      <Button
                        className="flex items-center gap-2"
                        onClick={() => setConnectionState({ connected: true, mode: 'restart' })}
                        variant="secondary"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restart
                      </Button>
                    </>
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

            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CollapsibleTrigger className="flex items-center font-medium gap-1 text-sm text-foreground hover:text-foreground transition-colors">
                    {isAdvancedOpen ? (
                      <>
                        Less options
                        <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        More options
                        <ChevronDown size={16} />
                      </>
                    )}
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className="space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm">Wanted collections</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info size={14} className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Comma-separated list of collections (leave blank for all)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
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
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm">Wanted DIDs</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info size={14} className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Comma-separated list of DIDs - Decentralized Identifiers, aka author IDs (max 10,000)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
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
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm">Cursor (microseconds)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info size={14} className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Unix timestamp in microseconds to begin streaming from (leave blank for latest)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    className="font-mono text-sm"
                    placeholder=""
                    value={options.cursor || ''}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        cursor: e.target.value || undefined,
                      })
                    }
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
