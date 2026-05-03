// react
import { useState } from 'react'

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

type InventoryExportModalProps = {
  isOpen: boolean
  onClose: () => void
  onExport?: (format: ExportFormat) => void
}

type ExportFormat = 'csv' | 'xlsx' | 'pdf'

/**
 * EXPORT_OPTIONS - React component
 * @returns React element
 */
const EXPORT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'XLSX' },
  { value: 'pdf', label: 'PDF' },
]

export const InventoryExportModal = ({ isOpen, onClose, onExport }: InventoryExportModalProps) => {
  // -- state --
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  /**
   * InventoryExportModal - React component
   * @returns React element
   */

  // -- derived --

  // -- handlers --
  const handleExport = () => {
    onExport?.(selectedFormat)
    onClose()
  }

  const handleOpenChange = (open: boolean) => {
    /**
     * handleExport - Utility function
     * @returns void
     */
    if (!open) {
      onClose()
    }
  }

  // -- render --
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      /** * handleOpenChange - Utility function * @returns void */
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
                Export
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-3">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500 lg:text-base">
                Choose format
              </p>
              <RadioGroup
                value={selectedFormat}
                onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
                className="gap-3"
              >
                {EXPORT_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`inventory-export-${option.value}`}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-base font-medium text-slate-900 transition hover:bg-slate-50"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`inventory-export-${option.value}`}
                      className="border-slate-400 text-blue-600"
                    />
                    {option.label}
                  </label>
                ))}
              </RadioGroup>
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
                onClick={handleExport}
                className="h-11 rounded-full px-8 text-base font-semibold hover:shadow-lg"
              >
                Export
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
