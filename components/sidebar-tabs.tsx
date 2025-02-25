import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import LiveFilters from '@/components/live-filters'
import MetricsDisplay from '@/components/metrics-display'
import { BarChart3Icon, FilterIcon } from 'lucide-react'
import { FilterOptions } from '@/components/live-filters'
import { SmartFilterRule } from '@/components/smart-filter'

type JetstreamMetrics = {
  // Totals
  totalMessages: number
  messagesByCollection: Record<string, number>
  totalCreates: number
  totalDeletes: number
  totalNewAccounts: number

  // Rates (per second)
  messagesPerSecond: number
  createPerSecond: number
  deletePerSecond: number
  newAccountsPerSecond: number
  collectionRates: Record<string, number>

  // For rate calculations
  lastUpdate: number
}

interface SidebarTabsProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  smartFilters: SmartFilterRule[]
  onSmartFiltersChange: (filters: SmartFilterRule[]) => void
  metrics: JetstreamMetrics
}

export function SidebarTabs({
  filters,
  onFiltersChange,
  smartFilters,
  onSmartFiltersChange,
  metrics,
}: SidebarTabsProps) {
  return (
    <Card className="h-[calc(100vh-100px)]">
      <Tabs defaultValue="filters" className="h-full flex flex-col">
        <TabsList className="grid grid-cols-2 mx-4 my-2">
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <FilterIcon size={14} />
            <span>Filters</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3Icon size={14} />
            <span>Metrics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="flex-1 overflow-auto px-0">
          <LiveFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            smartFilters={smartFilters}
            onSmartFiltersChange={onSmartFiltersChange}
          />
        </TabsContent>

        <TabsContent value="metrics" className="flex-1 overflow-auto px-0">
          <MetricsDisplay metrics={metrics} />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
