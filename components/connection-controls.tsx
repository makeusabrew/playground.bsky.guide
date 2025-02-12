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
    <div className="flex items-center justify-between gap-2 p-3">
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
                className=" flex items-center gap-2"
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
  )
}
