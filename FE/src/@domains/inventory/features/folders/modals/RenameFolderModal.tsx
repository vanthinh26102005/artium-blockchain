// react
import { useEffect, useState } from 'react'

// @shared - components
import { Button } from '@shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog'
import { Input } from '@shared/components/ui/input'

// @domains - inventory
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'

/**
 * MAX_FOLDER_NAME - React component
 * @returns React element
 */
const MAX_FOLDER_NAME = 80

type RenameFolderModalProps = {
  isOpen: boolean
  folder: InventoryFolder | null
  onClose: () => void
  onSave: (name: string) => void
}

export const RenameFolderModal = ({ isOpen, folder, onClose, onSave }: RenameFolderModalProps) => {
  // -- state --
  const [name, setName] = useState('')
  /**
   * RenameFolderModal - React component
   * @returns React element
   */

  // -- derived --
  const trimmedName = name.trim()
  const isSaveDisabled = trimmedName.length === 0

  // -- handlers --
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      /**
       * trimmedName - Utility function
       * @returns void
       */
      onClose()
    }
  }

  /**
   * isSaveDisabled - Utility function
   * @returns void
   */
  const handleSave = () => {
    if (isSaveDisabled) {
      return
    }

    onSave(trimmedName)
    /**
     * handleOpenChange - Utility function
     * @returns void
     */
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let isCancelled = false

    /**
     * handleSave - Utility function
     * @returns void
     */
    window.queueMicrotask(() => {
      if (isCancelled) {
        return
      }

      setName(folder?.name ?? '')
    })

    return () => {
      isCancelled = true
    }
  }, [folder?.name, isOpen])

  // -- render --
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        size="2xl"
        className="overflow-hidden rounded-3xl border border-white/30 bg-white/95 p-0 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-xl"
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b border-black/10 px-6 py-4">
            <DialogHeader className="px-0">
              <DialogTitle className="text-2xl font-semibold text-slate-900 lg:text-3xl">
                Rename Folder
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-500 lg:text-base">
                Folder name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Folder name"
                  maxLength={MAX_FOLDER_NAME}
                  className="h-12 rounded-full border-black/10 bg-white pr-14 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 md:text-base"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  {name.length}/{MAX_FOLDER_NAME}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-black/10 px-6 py-6">
            <DialogFooter className="justify-center gap-4 px-0">
              <Button
                variant="outline"
                size="lg"
                onClick={onClose}
                className="h-12 min-w-[140px] rounded-full px-10 text-lg font-medium"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={handleSave}
                disabled={isSaveDisabled}
                className="h-12 min-w-[140px] rounded-full px-10 text-lg font-semibold hover:shadow-lg disabled:bg-muted disabled:text-muted-foreground"
              >
                Save
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
