'use client'
import { useCallback } from 'react'
import { 
  createDir, 
  createFile, 
  deleteNode, 
  renameNode
} from '@/service/fileSystem'
import { useFileTree } from '@/contexts/file-tree-context'
import Toast from '@/components/base/toast'
import { useTranslation } from 'react-i18next'

export const useFileTreeOperations = () => {
  const { mutateTreeData } = useFileTree()
  const { t } = useTranslation()

  // 刷新文件树的通用方法
  const handleRefreshTree = useCallback(async () => {
    try {
      await mutateTreeData()
      return true
    } catch (error) {
        Toast.notify({ type: 'error', message: t('operate.error.refreshTreeFailed') })
        return false
    }
  }, [mutateTreeData])

  // 创建文件夹
  const handleCreateDir = useCallback(async (parentId: string, name: string) => {
    try {
      await createDir(parentId, name)
      Toast.notify({ type: 'success', message: t('operate.success.folderCreated') })
      await mutateTreeData()
    } catch (error) {
      Toast.notify({ type: 'error', message: t('operate.error.createFolderFailed') })
    }
  }, [mutateTreeData])

  // 创建文件
  const handleCreateFile = useCallback(async (
    parentId: string, 
    name: string, 
    content: string = '', 
    mimeType: string = 'text/plain'
  ) => {
    try {
      await createFile(parentId, name, content, mimeType)
      Toast.notify({ type: 'success', message: t('operate.success.fileCreated') })
      await mutateTreeData()
    } catch (error) {
      Toast.notify({ type: 'error', message: t('operate.error.createFileFailed') })
    }
  }, [mutateTreeData])

  // 删除节点
  const handleDeleteNode = useCallback(async (nodeId: string, nodeName?: string) => {
    try {
      await deleteNode(nodeId)
      Toast.notify({ type: 'success', message: nodeName ? t('operate.success.nodeDeleted', { name: nodeName }) : t('operate.success.projectDeleted') })
      await mutateTreeData()
    } catch (error) {
      Toast.notify({ type: 'error', message: t('operate.error.deleteFailed') })
    }
  }, [mutateTreeData])

  // 重命名节点
  const handleRenameNode = useCallback(async (nodeId: string, newName: string, oldName?: string) => {
    try {
      await renameNode(nodeId, newName)
      Toast.notify({ type: 'success', message: oldName ? t('operate.success.nodeRenamed', { name: oldName }) : t('operate.success.projectRenamed') })
      await mutateTreeData()
    } catch (error) {
      Toast.notify({ type: 'error', message: t('operate.error.renameFailed') })
    }
  }, [mutateTreeData])

  // 批量操作的确认对话框辅助方法
  const confirmOperation = useCallback((message: string, onConfirm: () => void) => {
    if (window.confirm(message)) {
      onConfirm()
    }
  }, [])

  return {
    handleRefreshTree,
    handleCreateDir,
    handleCreateFile,
    handleDeleteNode,
    handleRenameNode,
    confirmOperation
  }
}