import { Card } from '@/components/ui/card'

export default function MetricsDisplay() {
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <h2 className="font-semibold">stream metrics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">messages received</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">avg message size</p>
              <p className="text-2xl font-bold">0 B</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">messages/second</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  )
}
