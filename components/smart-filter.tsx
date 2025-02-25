import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Plus, X } from 'lucide-react'
import { Badge } from './ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Card } from './ui/card'

export interface SmartFilterRule {
  id: string
  path: string
  value: string
}

interface SmartFilterProps {
  filters: SmartFilterRule[]
  onFiltersChange: (filters: SmartFilterRule[]) => void
  disabled: boolean
}

export default function SmartFilter({ filters, onFiltersChange, disabled }: SmartFilterProps) {
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
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor="path">Smart filter</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  ?
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-80">
                <p>
                  Filter events by any nested property using dot notation.
                  <br />
                  Examples:
                  <br />- <code>did</code> (filter by DID)
                  <br />- <code>commit.collection</code> (filter by collection)
                  <br />- <code>commit.record.subject.uri</code> (filter by URI in likes/reposts)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="path"
              placeholder="Path (e.g. commit.collection)"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="flex-1">
            <Input
              id="value"
              placeholder="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              disabled={disabled}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addFilter()
                }
              }}
            />
          </div>
          <Button type="button" size="icon" onClick={addFilter} disabled={disabled || !newPath || !newValue}>
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {filters.length > 0 && (
        <div className="space-y-2">
          <Label>Active filters</Label>
          <Card className="p-2">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Badge key={filter.id} variant="secondary" className="flex items-center gap-1">
                  <span className="font-mono text-xs">
                    {filter.path}:{filter.value}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() => removeFilter(filter.id)}
                    disabled={disabled}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
