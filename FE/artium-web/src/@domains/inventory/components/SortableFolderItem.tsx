// react
import { CSSProperties } from 'react'

// third-party
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// @domains - inventory
import { InventoryFolderCard } from './InventoryFolderCard'
import { type InventoryFolder } from '@domains/inventory/types/inventoryFolder'

type FolderWithCount = InventoryFolder & { itemCount: number }

type SortableFolderItemProps = {
  folder: FolderWithCount
  onRename: (folder: InventoryFolder) => void
  onDelete: (folder: InventoryFolder) => void
  onHide: (folder: InventoryFolder) => void
}

export const SortableFolderItem = ({
  folder,
  onRename,
  onDelete,
  onHide,
}: SortableFolderItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id, data: { type: 'Folder', folder } })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
    position: 'relative',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <InventoryFolderCard
        folder={folder}
        onRename={onRename}
        onDelete={onDelete}
        onHide={onHide}
      />
    </div>
  )
}
