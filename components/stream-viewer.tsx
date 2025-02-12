import { Card } from '@/components/ui/card'

export default function StreamViewer() {
  return (
    <Card className="p-4 h-[600px] overflow-auto">
      <div className="space-y-2">
        <h2 className="font-semibold">stream output</h2>
        <pre className="text-sm">
          <code>Waiting for connection...</code>
        </pre>
      </div>
    </Card>
  )
}
