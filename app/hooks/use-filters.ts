import { useState } from 'react'
import { FilterOptions, COMMON_COLLECTIONS } from '@/components/live-filters'
import { JetstreamEvent } from '@/lib/playground/jetstream/types'

export function useFilters(messages: JetstreamEvent[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    showCreates: true,
    showUpdates: true,
    showDeletes: true,
    showIdentity: true,
    showAccount: true,
    selectedCollections: Object.keys(COMMON_COLLECTIONS),
    didFilter: '',
  })

  const filteredMessages = filterMessages(messages, filters)

  return {
    filters,
    setFilters,
    filteredMessages,
  }
}

function filterMessages(messages: JetstreamEvent[], filters: FilterOptions) {
  return messages.filter((msg) => {
    // Filter by event kind
    if (msg.kind === 'identity' && !filters.showIdentity) return false
    if (msg.kind === 'account' && !filters.showAccount) return false
    if (msg.kind === 'commit') {
      // Filter by operation type
      if (msg.commit.operation === 'create' && !filters.showCreates) return false
      if (msg.commit.operation === 'update' && !filters.showUpdates) return false
      if (msg.commit.operation === 'delete' && !filters.showDeletes) return false

      // Filter by collection
      if (!filters.selectedCollections.includes(msg.commit.collection)) {
        return false
      }
    }

    // Filter by DID
    if (filters.didFilter && !msg.did.toLowerCase().includes(filters.didFilter.toLowerCase())) {
      return false
    }

    return true
  })
}
