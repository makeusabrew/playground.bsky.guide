'use client'

import { Card } from './ui/card'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { Button } from './ui/button'

// Common Bluesky collections with friendly names
export const COMMON_COLLECTIONS = {
  'app.bsky.feed.post': 'Post',
  'app.bsky.feed.like': 'Like',
  'app.bsky.feed.repost': 'Repost',
  'app.bsky.graph.follow': 'Follow',
  'app.bsky.graph.block': 'Block',
  'app.bsky.actor.profile': 'Profile',
} as const

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
}

export default function LiveFilters({ filters, onFiltersChange }: LiveFiltersProps) {
  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-semibold">Live filters</h2>
          <p className="text-sm text-muted-foreground">Filter the stream in real-time</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Event types</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="creates"
                  checked={filters.showCreates}
                  onCheckedChange={(checked) => updateFilter('showCreates', checked)}
                />
                <label htmlFor="creates" className="text-sm">
                  Creates
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="updates"
                  checked={filters.showUpdates}
                  onCheckedChange={(checked) => updateFilter('showUpdates', checked)}
                />
                <label htmlFor="updates" className="text-sm">
                  Updates
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="deletes"
                  checked={filters.showDeletes}
                  onCheckedChange={(checked) => updateFilter('showDeletes', checked)}
                />
                <label htmlFor="deletes" className="text-sm">
                  Deletes
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="identity"
                  checked={filters.showIdentity}
                  onCheckedChange={(checked) => updateFilter('showIdentity', checked)}
                />
                <label htmlFor="identity" className="text-sm">
                  Identity
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="account"
                  checked={filters.showAccount}
                  onCheckedChange={(checked) => updateFilter('showAccount', checked)}
                />
                <label htmlFor="account" className="text-sm">
                  Account
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Collections</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                  <label htmlFor={collection} className="text-sm">
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
                  ×
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
