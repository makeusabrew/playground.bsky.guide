import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Plus, X, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Card } from './ui/card'

export interface PropertyFilterRule {
  id: string
  path: string
  value: string
}

interface PropertyFilterProps {
  filters: PropertyFilterRule[]
  onFiltersChange: (filters: PropertyFilterRule[]) => void
  disabled: boolean
}

export default function PropertyFilter({ filters, onFiltersChange, disabled }: PropertyFilterProps) {
  const [newPath, setNewPath] = useState('')
  const [newValue, setNewValue] = useState('')

  const addFilter = () => {
    if (!newPath || !newValue) return

    onFiltersChange([
      ...filters,
      {
        id: crypto.randomUUID(),
        path: newPath,
        value: newValue,
      },
    ])

    // Clear inputs
    setNewPath('')
    setNewValue('')
  }

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter((filter) => filter.id !== id))
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Advanced filters</h3>

          {/* Stack inputs vertically for better space usage */}
          <div className="space-y-2">
            <div>
              <div className="flex items-center gap-1.5">
                <Label htmlFor="path" className="text-sm">
                  Path
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={14} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>
                      The path of a property you want to filter on, using dot notation.
                      <br />
                      Examples:
                      <br />- <code>did</code>
                      {/* <br />- <code>commit.collection</code> (filter by collection) */}
                      <br />- <code>commit.record.subject.uri</code>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="path"
                placeholder="e.g. commit.collection"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                disabled={disabled}
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Label htmlFor="value" className="text-sm">
                  Value
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={14} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>
                      The value to match against. This is case-insensitive and matches partial values.
                      <br />
                      Examples:
                      <br />- <code>app.bsky.feed.post</code> for posts
                      <br />- <code>did:plc:</code> to match DIDs
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2 mt-1">
                <Input
                  id="value"
                  placeholder="Value to filter by"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  disabled={disabled}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addFilter()
                    }
                  }}
                />
                <Button type="button" size="icon" onClick={addFilter} disabled={disabled || !newPath || !newValue}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {filters.length > 0 && (
          <div className="space-y-2">
            <Label>Active advanced filters</Label>
            <Card className="p-2">
              <div className="flex flex-col gap-2">
                {filters.map((filter) => (
                  <div key={filter.id} className="flex items-center justify-between gap-2 w-full">
                    <div className="overflow-hidden">
                      <div className="font-mono text-xs truncate flex flex-col gap-1">
                        <span className="font-semibold">{filter.path}:</span> {filter.value}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 flex-shrink-0"
                      onClick={() => removeFilter(filter.id)}
                      disabled={disabled}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
