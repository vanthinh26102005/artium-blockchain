// react
import { useEffect, useState } from 'react'

// third-party
import { Folder } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@shared/components/ui/radio-group'
import { ScrollArea } from '@shared/components/ui/scroll-area'

// @domains - inventory
import { type InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'

const INVENTORY_DESTINATION_ID = 'inventory-root'

type MoveArtworkModalProps = {
  isOpen: boolean
  artwork: InventoryArtwork | null
  folders: InventoryFolder[]
  onClose: () => void
  onMove: (folderId?: string) => void
}

export const MoveArtworkModal = ({
  isOpen,
  artwork,
  folders,
  onClose,
  onMove,
}: MoveArtworkModalProps) => {
  // -- state --
  const [selectedDestination, setSelectedDestination] = useState(INVENTORY_DESTINATION_ID)

  // -- derived --
  const titleLabel = artwork ? `Move "${artwork.title}"` : 'Move artwork'

  // -- handlers --
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  const handleMove = () => {
    const destination =
      selectedDestination === INVENTORY_DESTINATION_ID ? undefined : selectedDestination
    onMove(destination)
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let isCancelled = false

    window.queueMicrotask(() => {
      if (isCancelled) {
        return
      }

      setSelectedDestination(artwork?.folderId ?? INVENTORY_DESTINATION_ID)
    })

    return () => {
      isCancelled = true
    }
  }, [artwork?.folderId, isOpen])

  // -- render --
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        size="3xl"
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
                {titleLabel}
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-3">
              <p className="text-sm font-bold tracking-wider text-slate-500 uppercase lg:text-base">
                Select destination
              </p>
              <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                <ScrollArea className="h-[360px]">
                  <RadioGroup
                    value={selectedDestination}
                    onValueChange={setSelectedDestination}
                    className="divide-y divide-black/10"
                  >
                    <label
                      htmlFor="move-destination-inventory"
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 text-base font-medium text-slate-900 transition hover:bg-slate-50"
                    >
                      <RadioGroupItem
                        id="move-destination-inventory"
                        value={INVENTORY_DESTINATION_ID}
                        className="border-slate-400 text-blue-600"
                      />
                      Inventory
                    </label>
                    {folders.map((folder) => (
                      <label
                        key={folder.id}
                        htmlFor={`move-destination-${folder.id}`}
                        className="flex cursor-pointer items-center gap-3 px-4 py-3 text-base font-medium text-slate-900 transition hover:bg-slate-50"
                      >
                        <RadioGroupItem
                          id={`move-destination-${folder.id}`}
                          value={folder.id}
                          className="border-slate-400 text-blue-600"
                        />
                        <span className="inline-flex items-center gap-2">
                          <Folder className="h-4 w-4 text-slate-500" />
                          {folder.name}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-black/10 px-6 py-4">
            <DialogFooter className="gap-3 px-0 sm:justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={onClose}
                className="h-11 rounded-full px-8 text-base"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={handleMove}
                disabled={!artwork}
                className="disabled:bg-muted disabled:text-muted-foreground h-11 rounded-full px-8 text-base font-semibold hover:shadow-lg"
              >
                Move
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
