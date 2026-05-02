import { useState } from 'react'

import artworkFolderApis from '@shared/apis/artworkFolderApis'
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'
import { type UserPayload } from '@shared/types/auth'

type UseFolderActionsProps = {
  user: UserPayload | null
  setToastMessage: (msg: string | null) => void
  onFolderCreated: (folder: InventoryFolder) => void
  onFolderRenamed: (id: string, name: string) => void
  onFolderDeleted: (id: string) => void
  onFolderHidden: (id: string, isHidden: boolean) => void
}

export const useFolderActions = ({
  user,
  setToastMessage,
  onFolderCreated,
  onFolderRenamed,
  onFolderDeleted,
  onFolderHidden,
}: UseFolderActionsProps) => {
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [renameFolderTarget, setRenameFolderTarget] = useState<InventoryFolder | null>(null)
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<InventoryFolder | null>(null)
  const [hideFolderTarget, setHideFolderTarget] = useState<InventoryFolder | null>(null)

  const handleOpenCreateFolder = () => {
    setIsCreateFolderOpen(true)
  }

  const handleCloseCreateFolder = () => {
    setIsCreateFolderOpen(false)
  }

  const handleCreateFolder = async (name: string, _description: string) => {
    if (!user?.id) {
      setToastMessage('Please log in to create a folder.')
      return
    }

    try {
      const created = await artworkFolderApis.createFolder({
        sellerId: user.id,
        name,
      })
      const newFolder: InventoryFolder = {
        id: created.id,
        name: created.name,
        isHidden: created.isHidden ?? false,
      }
      onFolderCreated(newFolder)
      setToastMessage('Folder created successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create folder.'
      setToastMessage(message)
    } finally {
      setIsCreateFolderOpen(false)
    }
  }

  const handleOpenRenameFolder = (folder: InventoryFolder) => {
    setRenameFolderTarget(folder)
  }

  const handleCloseRenameFolder = () => {
    setRenameFolderTarget(null)
  }

  const handleSaveRenameFolder = async (name: string) => {
    if (!renameFolderTarget) {
      return
    }

    try {
      await artworkFolderApis.updateFolder(renameFolderTarget.id, { name })
      onFolderRenamed(renameFolderTarget.id, name)
      setToastMessage('Folder renamed successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to rename folder.'
      setToastMessage(message)
    } finally {
      setRenameFolderTarget(null)
    }
  }

  const handleOpenDeleteFolder = (folder: InventoryFolder) => {
    setDeleteFolderTarget(folder)
  }

  const handleCloseDeleteFolder = () => {
    setDeleteFolderTarget(null)
  }

  const handleConfirmDeleteFolder = async () => {
    if (!deleteFolderTarget) {
      return
    }

    try {
      await artworkFolderApis.deleteFolder(deleteFolderTarget.id)
      onFolderDeleted(deleteFolderTarget.id)
      setToastMessage('Folder deleted successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete folder.'
      setToastMessage(message)
    } finally {
      setDeleteFolderTarget(null)
    }
  }

  const handleOpenHideFolder = (folder: InventoryFolder) => {
    setHideFolderTarget(folder)
  }

  const handleCloseHideFolder = () => {
    setHideFolderTarget(null)
  }

  const handleConfirmHideFolder = async () => {
    if (!hideFolderTarget) {
      return
    }

    if (!user?.id) {
      setToastMessage('Please log in to hide a folder.')
      return
    }

    try {
      await artworkFolderApis.toggleVisibility(hideFolderTarget.id, {
        sellerId: user.id,
        isHidden: true,
      })
      onFolderHidden(hideFolderTarget.id, true)
      setToastMessage('Folder hidden successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to hide folder.'
      setToastMessage(message)
    } finally {
      setHideFolderTarget(null)
    }
  }

  return {
    isCreateFolderOpen,
    renameFolderTarget,
    deleteFolderTarget,
    hideFolderTarget,
    handleOpenCreateFolder,
    handleCloseCreateFolder,
    handleCreateFolder,
    handleOpenRenameFolder,
    handleCloseRenameFolder,
    handleSaveRenameFolder,
    handleOpenDeleteFolder,
    handleCloseDeleteFolder,
    handleConfirmDeleteFolder,
    handleOpenHideFolder,
    handleCloseHideFolder,
    handleConfirmHideFolder,
  }
}
