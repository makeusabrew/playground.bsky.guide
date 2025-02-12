'use client'
import { createContext, useContext, ReactNode } from 'react'
import { useJetstream } from '@/app/hooks/use-jetstream'

const JetstreamContext = createContext<ReturnType<typeof useJetstream> | null>(null)

export function JetstreamProvider({
  children,
  ...options
}: { children: ReactNode } & Parameters<typeof useJetstream>[0]) {
  const jetstream = useJetstream(options)
  return <JetstreamContext.Provider value={jetstream}>{children}</JetstreamContext.Provider>
}

export function useJetstreamContext() {
  const context = useContext(JetstreamContext)
  if (!context) throw new Error('useJetstreamContext must be used within JetstreamProvider')
  return context
}
