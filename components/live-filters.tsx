'use client'

import { Switch } from './ui/switch'
import {
  Plus,
  Pencil,
  Trash,
  UserRound,
  ShieldCheck,
  MessageSquare,
  Heart,
  Repeat,
  Users,
  Ban,
  User,
} from 'lucide-react'

/**
 * TODO: segment the filters properly here - we've got "identity" and "account" as "event types"
 * but these are `kind` properties (commit, identity, account)
 *
 * Similarly the other "types" are "operation"
 */

// Common Bluesky collections with friendly names
export const COMMON_COLLECTIONS = {
  'app.bsky.feed.post': 'Post',
  'app.bsky.feed.like': 'Like',
  'app.bsky.feed.repost': 'Repost',
  'app.bsky.graph.follow': 'Follow',
  'app.bsky.graph.block': 'Block',
  'app.bsky.actor.profile': 'Profile',
} as const

const COLLECTION_ICONS: Record<string, React.ReactNode> = {
  'app.bsky.feed.post': <MessageSquare size={14} />,
  'app.bsky.feed.like': <Heart size={14} />,
  'app.bsky.feed.repost': <Repeat size={14} />,
  'app.bsky.graph.follow': <Users size={14} />,
  'app.bsky.graph.block': <Ban size={14} />,
  'app.bsky.actor.profile': <User size={14} />,
}

export interface FilterOptions {
  showCreates: boolean
  showUpdates: boolean
  showDeletes: boolean
  showIdentity: boolean
  showAccount: boolean
  selectedCollections: string[]
  didFilter: string
}

interface LiveFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  disabled: boolean
}

export default function LiveFilters({ filters, onFiltersChange, disabled }: LiveFiltersProps) {
  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="p-3">
      {/* Event Types Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Event types</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plus size={14} />
              <span className="text-sm">Creates</span>
            </div>
            <Switch
              checked={filters.showCreates}
              onCheckedChange={(checked) => updateFilter('showCreates', checked)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Pencil size={14} />
              <span className="text-sm">Updates</span>
            </div>
            <Switch
              checked={filters.showUpdates}
              onCheckedChange={(checked) => updateFilter('showUpdates', checked)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trash size={14} />
              <span className="text-sm">Deletes</span>
            </div>
            <Switch
              checked={filters.showDeletes}
              onCheckedChange={(checked) => updateFilter('showDeletes', checked)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserRound size={14} />
              <span className="text-sm">Identity</span>
            </div>
            <Switch
              checked={filters.showIdentity}
              onCheckedChange={(checked) => updateFilter('showIdentity', checked)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck size={14} />
              <span className="text-sm">Account</span>
            </div>
            <Switch
              checked={filters.showAccount}
              onCheckedChange={(checked) => updateFilter('showAccount', checked)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Collections Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Collections</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(COMMON_COLLECTIONS).map(([collection, label]) => (
            <div key={collection} className="flex items-center space-x-2">
              <Switch
                checked={filters.selectedCollections.includes(collection)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter('selectedCollections', [...filters.selectedCollections, collection])
                  } else {
                    updateFilter(
                      'selectedCollections',
                      filters.selectedCollections.filter((c) => c !== collection)
                    )
                  }
                }}
                disabled={disabled}
              />
              <div className="flex items-center space-x-1">
                {COLLECTION_ICONS[collection]}
                <span className="text-sm">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DID Filter Section */}
      <div>
        <h3 className="text-sm font-medium mb-2">DID filter</h3>
        <input
          type="text"
          placeholder="Filter by DID"
          className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
          value={filters.didFilter}
          onChange={(e) => updateFilter('didFilter', e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
