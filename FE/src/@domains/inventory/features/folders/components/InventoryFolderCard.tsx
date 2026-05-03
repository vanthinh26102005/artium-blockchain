// next
import Link from 'next/link'

// third-party
import { EyeOff, Folder, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

// @shared - components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'

// @domains - inventory
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'

type FolderWithCount = InventoryFolder & { itemCount: number }

type InventoryFolderCardProps = {
  folder: FolderWithCount
  onRename: (folder: InventoryFolder) => void
  onDelete: (folder: InventoryFolder) => void
  onHide: (folder: InventoryFolder) => void
}

/**
 * InventoryFolderCard - React component
 * @returns React element
 */
export const InventoryFolderCard = ({
  folder,
  onRename,
  onDelete,
  onHide,
}: InventoryFolderCardProps) => {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition-shadow hover:shadow-lg">
      {/* actions */}
      <div className="absolute top-3 right-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              aria-label="Folder actions"
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
        <div className="flex h-[150px] items-center justify-center bg-blue-50">
          <Folder className="h-8 w-8 text-blue-600" />
        </div>
        <div className="flex min-h-[100px] flex-1 flex-col gap-1 px-3 pt-3 pb-3">
          <p className="text-base font-medium text-slate-900">{folder.name}</p>
          <p className="text-sm text-[#898788]">{folder.itemCount} items</p>
        </div>
      </Link>
    </div>
  )
}
