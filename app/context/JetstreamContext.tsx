'use client'
import { createContext, useContext, useEffect } from 'react'
import { useJetstream } from '@/app/hooks/use-jetstream'
import type { ConnectionOptions } from '@/types/jetstream'

type JetstreamContextType = ReturnType<typeof useJetstream>

const JetstreamContext = createContext<JetstreamContextType | null>(null)

interface JetstreamProviderProps {
  children: React.ReactNode
  options: ConnectionOptions
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

  return <JetstreamContext.Provider value={{ ...jetstream }}>{children}</JetstreamContext.Provider>
}

export function useJetstreamContext() {
  const context = useContext(JetstreamContext)
  if (!context) throw new Error('useJetstreamContext must be used within JetstreamProvider')
  return context
}
