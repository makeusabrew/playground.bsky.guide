'use client'
import { createContext, useContext, ReactNode, useState } from 'react'
import { useJetstream } from '@/app/hooks/use-jetstream'

type JetstreamConfig = {
  instance: string
  collections: string
  dids: string
  cursor: string
  messageLimit: string
}

type JetstreamContextType = ReturnType<typeof useJetstream> & {
  config: JetstreamConfig
  updateConfig: (updates: Partial<JetstreamConfig>) => void
}

const defaultConfig: JetstreamConfig = {
  instance: 'jetstream1.us-east.bsky.network',
  collections: '',
  dids: '',
  cursor: '',
  messageLimit: '1000',
}

const JetstreamContext = createContext<JetstreamContextType | null>(null)

export function JetstreamProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<JetstreamConfig>(defaultConfig)

  const jetstream = useJetstream(config)

  const updateConfig = (updates: Partial<JetstreamConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  return (
    <JetstreamContext.Provider value={{ ...jetstream, config, updateConfig }}>{children}</JetstreamContext.Provider>
  )
}

export function useJetstreamContext() {
  const context = useContext(JetstreamContext)
  if (!context) throw new Error('useJetstreamContext must be used within JetstreamProvider')
  return context
}
