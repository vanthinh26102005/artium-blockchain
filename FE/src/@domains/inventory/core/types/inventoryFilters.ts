export type InventoryFilters = {
  status?: string
  minPrice?: number
  maxPrice?: number
}

/**
 * DEFAULT_INVENTORY_FILTERS - React component
 * @returns React element
 */
export const DEFAULT_INVENTORY_FILTERS: InventoryFilters = {}
