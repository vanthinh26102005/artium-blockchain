export type InventoryFilters = {
  status?: string
  minPrice?: number
  maxPrice?: number
}

export const DEFAULT_INVENTORY_FILTERS: InventoryFilters = {}
