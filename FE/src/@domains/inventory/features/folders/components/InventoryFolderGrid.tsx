// third-party
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'

// @domains - inventory
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'
import { SortableFolderItem } from '@domains/inventory/features/folders/components/SortableFolderItem'

type FolderWithCount = InventoryFolder & { itemCount: number }

type InventoryFolderGridProps = {
  folders: FolderWithCount[]
  onRename: (folder: InventoryFolder) => void
  onDelete: (folder: InventoryFolder) => void
  onHide: (folder: InventoryFolder) => void
}

/**
 * InventoryFolderGrid - React component
 * @returns React element
 */
export const InventoryFolderGrid = ({
  folders,
  onRename,
  onDelete,
  onHide,
}: InventoryFolderGridProps) => {
  // -- render --
  return (
    <SortableContext items={folders.map((f) => f.id)} strategy={rectSortingStrategy}>
      <div className="mb-4 mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {folders.map((folder) => (
          <SortableFolderItem
            key={folder.id}
            folder={folder}
            onRename={onRename}
            onDelete={onDelete}
            onHide={onHide}
          />
        ))}
      </div>
    </SortableContext>
  )
}
