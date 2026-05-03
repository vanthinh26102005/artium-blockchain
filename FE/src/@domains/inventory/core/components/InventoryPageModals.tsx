// @domains - inventory
import { InventoryToast } from '@domains/inventory/core/components/InventoryToast'
import { ConfirmDeleteModal } from '@domains/inventory/features/artworks/modals/ConfirmDeleteModal'
import { CreateFolderModal } from '@domains/inventory/features/folders/modals/CreateFolderModal'
import { DeleteFolderModal } from '@domains/inventory/features/folders/modals/DeleteFolderModal'
import { HideFolderModal } from '@domains/inventory/features/folders/modals/HideFolderModal'
import { InventoryExportModal } from '@domains/inventory/core/components/modals/InventoryExportModal'
import { MoveArtworkModal } from '@domains/inventory/features/artworks/modals/MoveArtworkModal'
import { RenameFolderModal } from '@domains/inventory/features/folders/modals/RenameFolderModal'
import { type InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'

type InventoryPageModalsProps = {
  isCreateFolderOpen: boolean
  onCloseCreateFolder: () => void
  onCreateFolder: (name: string, description: string) => void

  isExportModalOpen: boolean
  onCloseExportModal: () => void
  onExport: () => void

  deleteTarget: InventoryArtwork | null
  isDeletingArtwork?: boolean
  onCloseDeleteModal: () => void
  onConfirmDelete: () => void

  renameFolderTarget: InventoryFolder | null
  onCloseRenameFolder: () => void
  onSaveRenameFolder: (name: string) => void

  deleteFolderTarget: InventoryFolder | null
  onCloseDeleteFolder: () => void
  onConfirmDeleteFolder: () => void

  hideFolderTarget: InventoryFolder | null
  onCloseHideFolder: () => void
  onConfirmHideFolder: () => void

  moveTarget: InventoryArtwork | null
  folders: InventoryFolder[]
  onCloseMoveModal: () => void
  onConfirmMove: (folderId?: string) => void

  toastMessage: string | null
  onCloseToast: () => void
}

/**
 * InventoryPageModals - React component
 * @returns React element
 */
export const InventoryPageModals = ({
  isCreateFolderOpen,
  onCloseCreateFolder,
  onCreateFolder,
  isExportModalOpen,
  onCloseExportModal,
  onExport,
  deleteTarget,
  isDeletingArtwork = false,
  onCloseDeleteModal,
  onConfirmDelete,
  renameFolderTarget,
  onCloseRenameFolder,
  onSaveRenameFolder,
  deleteFolderTarget,
  onCloseDeleteFolder,
  onConfirmDeleteFolder,
  hideFolderTarget,
  onCloseHideFolder,
  onConfirmHideFolder,
  moveTarget,
  folders,
  onCloseMoveModal,
  onConfirmMove,
  toastMessage,
  onCloseToast,
}: InventoryPageModalsProps) => {
  // -- render --
  return (
    <>
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={onCloseCreateFolder}
        onCreate={onCreateFolder}
      />
      <InventoryExportModal
        isOpen={isExportModalOpen}
        onClose={onCloseExportModal}
        onExport={onExport}
      />
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        artworkTitle={deleteTarget?.title ?? ''}
        isDeleting={isDeletingArtwork}
        onCancel={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
      />
      <RenameFolderModal
        isOpen={Boolean(renameFolderTarget)}
        folder={renameFolderTarget}
        onClose={onCloseRenameFolder}
        onSave={onSaveRenameFolder}
      />
      <DeleteFolderModal
        isOpen={Boolean(deleteFolderTarget)}
        folder={deleteFolderTarget}
        onCancel={onCloseDeleteFolder}
        onConfirm={onConfirmDeleteFolder}
      />
      <HideFolderModal
        isOpen={Boolean(hideFolderTarget)}
        folder={hideFolderTarget}
        onCancel={onCloseHideFolder}
        onConfirm={onConfirmHideFolder}
      />
      <MoveArtworkModal
        isOpen={Boolean(moveTarget)}
        artwork={moveTarget}
        folders={folders}
        onClose={onCloseMoveModal}
        onMove={onConfirmMove}
      />
      {toastMessage ? <InventoryToast message={toastMessage} onClose={onCloseToast} /> : null}
    </>
  )
}
