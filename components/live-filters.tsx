'use client'

import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { Button } from './ui/button'
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
  X,
  Filter,
} from 'lucide-react'

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
    <div className={`p-3 ${disabled ? 'opacity-100' : ''}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3 -mx-3 px-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            Live filters
          </h2>
          {/* <p className="text-sm text-muted-foreground">Filter the stream in real-time</p> */}
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Event types</h3>
            <div className=" flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="creates"
                  checked={filters.showCreates}
                  onCheckedChange={(checked) => updateFilter('showCreates', checked)}
                />
                <label htmlFor="creates" className="text-sm flex items-center gap-1.5">
                  <Plus size={14} />
                  Creates
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="updates"
                  checked={filters.showUpdates}
                  onCheckedChange={(checked) => updateFilter('showUpdates', checked)}
                />
                <label htmlFor="updates" className="text-sm flex items-center gap-1.5">
                  <Pencil size={14} />
                  Updates
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="deletes"
                  checked={filters.showDeletes}
                  onCheckedChange={(checked) => updateFilter('showDeletes', checked)}
                />
                <label htmlFor="deletes" className="text-sm flex items-center gap-1.5">
                  <Trash size={14} />
                  Deletes
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="identity"
                  checked={filters.showIdentity}
                  onCheckedChange={(checked) => updateFilter('showIdentity', checked)}
                />
                <label htmlFor="identity" className="text-sm flex items-center gap-1.5">
                  <UserRound size={14} />
                  Identity
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="account"
                  checked={filters.showAccount}
                  onCheckedChange={(checked) => updateFilter('showAccount', checked)}
                />
                <label htmlFor="account" className="text-sm flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  Account
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Collections</h3>
            <div className="flex flex-col gap-2">
              {Object.entries(COMMON_COLLECTIONS).map(([collection, name]) => (
                <div key={collection} className="flex items-center space-x-2">
                  <Switch
                    id={collection}
                    checked={filters.selectedCollections.includes(collection)}
                    onCheckedChange={(checked) => {
                      updateFilter(
                        'selectedCollections',
                        checked
                          ? [...filters.selectedCollections, collection]
                          : filters.selectedCollections.filter((c) => c !== collection)
                      )
                    }}
                  />
                  <label htmlFor={collection} className="text-sm flex items-center gap-1.5">
                    {COLLECTION_ICONS[collection]}
                    {name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">DID filter</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter DID to filter"
                value={filters.didFilter}
                onChange={(e) => updateFilter('didFilter', e.target.value)}
              />
              {filters.didFilter && (
                <Button variant="outline" size="icon" onClick={() => updateFilter('didFilter', '')}>
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
