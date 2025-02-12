'use client'
import { Card } from '@/components/ui/card'
import { useJetstream } from '@/app/hooks/use-jetstream'

export default function StreamViewer() {
  const { messages } = useJetstream({
    instance: '', // We'll get these from a shared context in a moment
  })

  return (
    <Card className="p-4 h-[600px] overflow-auto">
      <div className="space-y-2">
        <h2 className="font-semibold">stream output</h2>
        <pre className="text-sm font-mono">
          <code>
            {messages.length === 0
              ? 'Waiting for connection...'
              : messages.map((msg, i) => (
                  <div key={i} className="border-b py-2">
                    {msg}
                  </div>
                ))}
          </code>
        </pre>
      </div>
    </Card>
  )
}
