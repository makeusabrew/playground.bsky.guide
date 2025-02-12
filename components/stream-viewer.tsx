'use client'
import { Card } from '@/components/ui/card'
import { useJetstreamContext } from '@/app/context/JetstreamContext'

export default function StreamViewer() {
  const { messages } = useJetstreamContext()

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
