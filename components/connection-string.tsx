import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { JetstreamConfig } from '@/types/jetstream'
import { Copy, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function ConnectionString({ options }: { options: JetstreamConfig }) {
  const connectionStrings = buildConnectionString(options)

  return (
    <TooltipProvider>
      <div>
        <div className="space-y-4">
          <div className="flex items-center gap-1.5">
            <h2 className="font-medium text-sm">Connection string</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={14} className="text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>The WebSocket URL and code snippets you can use to connect to Jetstream</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Tabs defaultValue="raw" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="raw" className="flex items-center gap-2 text-xs">
                URL
              </TabsTrigger>
              <TabsTrigger value="javascript" className="flex items-center gap-2 text-xs">
                JavaScript
              </TabsTrigger>
              {/* <TabsTrigger value="websocat" className="flex items-center gap-2 text-xs">
                Websocat
              </TabsTrigger> */}
            </TabsList>

            {['raw', 'websocat', 'javascript'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-2">
                <div className="relative">
                  <div className="text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto font-mono">
                    <code>{connectionStrings[tab as keyof typeof connectionStrings]}</code>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 hover:bg-background"
                    onClick={() =>
                      navigator.clipboard.writeText(connectionStrings[tab as keyof typeof connectionStrings])
                    }
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
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
  const baseUrl = `wss://${options.instance}/subscribe`
  return {
    raw: `${baseUrl}${queryString ? '?' + queryString : ''}`,
    websocat: `websocat '${baseUrl}${queryString ? '\\?' + queryString : ''}'`,
    javascript: `const ws = new WebSocket("${baseUrl}${queryString ? '?' + queryString : ''}")`,
  }
}
