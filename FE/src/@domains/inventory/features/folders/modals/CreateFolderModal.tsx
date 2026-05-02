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
import { Textarea } from '@shared/components/ui/textarea'

const MAX_FOLDER_NAME = 80

type CreateFolderModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, description: string) => void
}

export const CreateFolderModal = ({ isOpen, onClose, onCreate }: CreateFolderModalProps) => {
  // -- state --
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // -- derived --
  const trimmedName = name.trim()
  const isCreateDisabled = trimmedName.length === 0

  // -- handlers --
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  const handleCreate = () => {
    if (isCreateDisabled) {
      return
    }

    onCreate(trimmedName, description.trim())
  }

  useEffect(() => {
    if (!isOpen) {
      let isCancelled = false

      window.queueMicrotask(() => {
        if (isCancelled) {
          return
        }

        setName('')
        setDescription('')
      })

      return () => {
        isCancelled = true
      }
    }
  }, [isOpen])

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
                New Folder
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold tracking-wider text-slate-500 uppercase lg:text-base">
                  Folder name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Collector Picks"
                    maxLength={MAX_FOLDER_NAME}
                    className="h-12 rounded-full border-black/10 bg-white pr-14 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 md:text-base"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-slate-400">
                    {name.length}/{MAX_FOLDER_NAME}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold tracking-wider text-slate-500 uppercase lg:text-base">
                  Description (optional)
                </label>
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add a short note"
                  className="min-h-[96px] rounded-2xl border-black/10 bg-white text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 md:text-base"
                />
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
                onClick={handleCreate}
                disabled={isCreateDisabled}
                className="disabled:bg-muted disabled:text-muted-foreground h-11 rounded-full px-8 text-base font-semibold hover:shadow-lg"
              >
                Create
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
