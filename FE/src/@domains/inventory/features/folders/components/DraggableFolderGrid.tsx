// react
import { useMemo, useState } from 'react'

// next
import Link from 'next/link'

// third-party
import { EyeOff, Folder, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// @shared - components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'

// @domains - inventory
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'
import { useInventoryDataStore } from '@domains/inventory/core/stores/useInventoryDataStore'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import artworkFolderApis from '@shared/apis/artworkFolderApis'

type FolderWithCount = InventoryFolder & { itemCount: number }

/**
 * dedupeFoldersById - Utility function
 * @returns void
 */
const dedupeFoldersById = (folders: FolderWithCount[]) => {
  const seen = new Set<string>()

  return folders.filter((folder) => {
/**
 * seen - Utility function
 * @returns void
 */
    if (seen.has(folder.id)) {
      return false
    }

    seen.add(folder.id)
    return true
  })
}

type SortableFolderItemProps = {
  folder: FolderWithCount
  onRename: (folder: InventoryFolder) => void
  onDelete: (folder: InventoryFolder) => void
  onHide: (folder: InventoryFolder) => void
}

const SortableFolderItem = ({ folder, onRename, onDelete, onHide }: SortableFolderItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: folder.id,
  })

  const style = {
/**
 * SortableFolderItem - React component
 * @returns React element
 */
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition-shadow hover:shadow-lg">
/**
 * style - Utility function
 * @returns void
 */
        {/* actions */}
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                aria-label="Folder actions"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl border-black/10 bg-white p-2 shadow-lg"
            >
              <DropdownMenuItem
                onSelect={() => onRename(folder)}
                className="gap-2 px-3 py-2 text-base font-semibold text-slate-900"
              >
                <Pencil className="h-4 w-4 text-slate-600" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onDelete(folder)}
                className="gap-2 px-3 py-2 text-base font-semibold text-rose-600"
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
                Delete folder
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onHide(folder)}
                className="gap-2 px-3 py-2 text-base font-semibold text-slate-900"
              >
                <EyeOff className="h-4 w-4 text-slate-600" />
                Hide folder on profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* link content */}
        <Link href={`/inventory/folder/${folder.id}`} className="flex h-full flex-col">
          <div className="flex h-[150px] items-center justify-center bg-[#F5F5F5]">
            <Folder className="h-8 w-8 text-slate-400" />
          </div>
          <div className="flex min-h-[100px] flex-1 flex-col gap-1 px-3 pt-3 pb-3">
            <p className="text-base font-medium text-slate-900">{folder.name}</p>
            <p className="text-sm text-[#898788]">{folder.itemCount} items</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

type DraggableFolderGridProps = {
  folders: FolderWithCount[]
  onRename: (folder: InventoryFolder) => void
  onDelete: (folder: InventoryFolder) => void
  onHide: (folder: InventoryFolder) => void
  onError?: (message: string) => void
}

export const DraggableFolderGrid = ({
  folders,
  onRename,
  onDelete,
  onHide,
  onError,
}: DraggableFolderGridProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const dedupedFolders = useMemo(() => dedupeFoldersById(folders), [folders])
  const [localFolders, setLocalFolders] = useState<FolderWithCount[] | null>(null)
  const optimisticReorderFolders = useInventoryDataStore((state) => state.optimisticReorderFolders)
  const user = useAuthStore((state) => state.user)
/**
 * DraggableFolderGrid - React component
 * @returns React element
 */
  const renderedFolders = localFolders ?? dedupedFolders

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
/**
 * dedupedFolders - Utility function
 * @returns void
 */
  )

  const handleDragStart = (event: DragStartEvent) => {
    setLocalFolders(renderedFolders)
    setActiveId(event.active.id as string)
/**
 * optimisticReorderFolders - Utility function
 * @returns void
 */
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
/**
 * user - Custom React hook
 * @returns void
 */

    if (!over || active.id === over.id) {
      setLocalFolders(null)
      setActiveId(null)
/**
 * renderedFolders - Utility function
 * @returns void
 */
      return
    }

    const oldIndex = renderedFolders.findIndex((f) => f.id === active.id)
    const newIndex = renderedFolders.findIndex((f) => f.id === over.id)
/**
 * sensors - Utility function
 * @returns void
 */

    if (oldIndex === -1 || newIndex === -1) {
      setLocalFolders(null)
      setActiveId(null)
      return
    }

    const reordered = arrayMove(renderedFolders, oldIndex, newIndex)
    setLocalFolders(reordered)

    const folderIds = reordered.map((f) => f.id)
    optimisticReorderFolders(folderIds)

    if (user?.id) {
/**
 * handleDragStart - Utility function
 * @returns void
 */
      try {
        await artworkFolderApis.reorderFolders({
          sellerId: user.id,
          folderIds,
        })
        setLocalFolders(null)
      } catch {
        setLocalFolders(dedupedFolders)
/**
 * handleDragEnd - Utility function
 * @returns void
 */
        optimisticReorderFolders(dedupedFolders.map((f) => f.id))
        onError?.('Failed to reorder folders')
      }
    }

    setActiveId(null)
  }

  const activeFolder = activeId ? renderedFolders.find((f) => f.id === activeId) : null

  return (
    <DndContext
/**
 * oldIndex - Utility function
 * @returns void
 */
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
/**
 * newIndex - Utility function
 * @returns void
 */
    >
      <SortableContext items={renderedFolders.map((f) => f.id)} strategy={rectSortingStrategy}>
        <div className="mt-4 mb-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {renderedFolders.map((folder) => (
            <SortableFolderItem
              key={folder.id}
              folder={folder}
              onRename={onRename}
              onDelete={onDelete}
              onHide={onHide}
            />
/**
 * reordered - Utility function
 * @returns void
 */
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeFolder ? (
/**
 * folderIds - Utility function
 * @returns void
 */
          <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl transition-shadow">
            <div className="flex h-[150px] items-center justify-center bg-[#F5F5F5]">
              <Folder className="h-8 w-8 text-slate-400" />
            </div>
            <div className="flex min-h-[100px] flex-1 flex-col gap-1 px-3 pt-3 pb-3">
              <p className="text-base font-medium text-slate-900">{activeFolder.name}</p>
              <p className="text-sm text-[#898788]">{activeFolder.itemCount} items</p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

/**
 * activeFolder - Utility function
 * @returns void
 */