// @domains - inventory
import { InventoryToast } from '@domains/inventory/components/InventoryToast'
import { ConfirmDeleteModal } from '@domains/inventory/components/modals/ConfirmDeleteModal'
import { CreateFolderModal } from '@domains/inventory/components/modals/CreateFolderModal'
import { DeleteFolderModal } from '@domains/inventory/components/modals/DeleteFolderModal'
import { HideFolderModal } from '@domains/inventory/components/modals/HideFolderModal'
import { InventoryExportModal } from '@domains/inventory/components/modals/InventoryExportModal'
import { MoveArtworkModal } from '@domains/inventory/components/modals/MoveArtworkModal'
import { RenameFolderModal } from '@domains/inventory/components/modals/RenameFolderModal'
import { type InventoryArtwork } from '@domains/inventory/types/inventoryArtwork'
import { type InventoryFolder } from '@domains/inventory/types/inventoryFolder'

type InventoryPageModalsProps = {
  isCreateFolderOpen: boolean
  onCloseCreateFolder: () => void
  onCreateFolder: (name: string, description: string) => void

  isExportModalOpen: boolean
  onCloseExportModal: () => void
  onExport: () => void

  deleteTarget: InventoryArtwork | null
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

export const InventoryPageModals = ({
  isCreateFolderOpen,
  onCloseCreateFolder,
  onCreateFolder,
  isExportModalOpen,
  onCloseExportModal,
  onExport,
  deleteTarget,
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
