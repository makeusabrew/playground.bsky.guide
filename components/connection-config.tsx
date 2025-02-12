import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ConnectionConfig() {
  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="font-semibold">connection settings</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>instance</Label>
            <Select defaultValue="jetstream2.us-east.bsky.network">
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
            <Input placeholder="app.bsky.feed.post,app.bsky.feed.like" />
            <p className="text-xs text-muted-foreground">Comma-separated list of collections</p>
          </div>

          <div className="space-y-2">
            <Label>wanted DIDs</Label>
            <Input placeholder="did:plc:1234,did:plc:5678" />
            <p className="text-xs text-muted-foreground">Comma-separated list of DIDs (max 10,000)</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="compression" />
            <Label htmlFor="compression">enable compression</Label>
          </div>

          <Button className="w-full">connect</Button>
        </div>
      </div>
    </Card>
  )
}
