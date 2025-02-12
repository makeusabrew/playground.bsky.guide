'use client'
import { createContext, useContext, useEffect } from 'react'
import { useJetstream } from '@/app/hooks/use-jetstream'
import { JetstreamConfig } from '@/types/jetstream'
import { JetstreamMetrics } from '@/lib/playground/jetstream/types'

type JetstreamContextType = {
  metrics: JetstreamMetrics
  messages: string[]
  status: string
  error: Error | undefined
}

const JetstreamContext = createContext<JetstreamContextType | null>(null)

interface JetstreamProviderProps {
  children: React.ReactNode
  options: JetstreamConfig
  isConnected: boolean
}

export function JetstreamProvider({ children, options, isConnected }: JetstreamProviderProps) {
  const jetstream = useJetstream(options)

  useEffect(() => {
    if (isConnected) {
      jetstream.connect()
    } else {
      jetstream.disconnect()
    }
  }, [isConnected])

  const contextValue: JetstreamContextType = {
    metrics: jetstream.metrics,
    messages: jetstream.messages,
    status: jetstream.status,
    error: jetstream.error,
  }

  return <JetstreamContext.Provider value={contextValue}>{children}</JetstreamContext.Provider>
}

export function useJetstreamContext() {
  const context = useContext(JetstreamContext)
  if (!context) throw new Error('useJetstreamContext must be used within JetstreamProvider')
  return context
}
