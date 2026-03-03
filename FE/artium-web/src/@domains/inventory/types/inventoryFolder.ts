export type InventoryFolder = {
  id: string
  name: string
  description?: string
  isHidden?: boolean
  itemCount?: number
  parentId?: string | null
  children?: InventoryFolder[]
}
