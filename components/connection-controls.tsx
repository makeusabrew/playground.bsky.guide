'use client'
import { Button } from '@/components/ui/button'
import { PauseCircle, PlayCircle, RotateCcw } from 'lucide-react'
import { ConnectionState } from '@/app/page'

interface ConnectionControlsProps {
  hasEverConnected: boolean
  connectionState: ConnectionState
  setConnectionState: (connectionState: ConnectionState) => void
}

export default function ConnectionControls({
  hasEverConnected,
  connectionState,
  setConnectionState,
}: ConnectionControlsProps) {
  const isConnected = connectionState.connected

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <Button
          size="lg"
          className="min-w-[120px] flex items-center gap-2"
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
                size="lg"
                className="min-w-[120px] flex items-center gap-2"
                onClick={() => setConnectionState({ connected: true, mode: 'resume' })}
              >
                <PlayCircle className="w-4 h-4" />
                Resume
              </Button>
              <Button
                size="lg"
                className="min-w-[120px] flex items-center gap-2"
                onClick={() => setConnectionState({ connected: true, mode: 'restart' })}
                variant="secondary"
              >
                <RotateCcw className="w-4 h-4" />
                Restart
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              className="min-w-[120px] flex items-center gap-2"
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
  )
}
