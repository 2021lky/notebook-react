'use client'
import { useCallback } from 'react'
import { 
  createDir, 
  createFile, 
  deleteNode, 
  renameNode
} from '@/service/fileSystem'
import { useFileTree } from '@/contexts/file-tree-context'
import { useToastContext } from '@/components/base/toast'
import { useTranslation } from 'react-i18next'

export const useFileTreeOperations = () => {
  const { mutateTreeData } = useFileTree()
  const { notify } = useToastContext()
  const { t } = useTranslation()

  // 刷新文件树的通用方法
  const handleRefreshTree = useCallback(async () => {
    try {
      await mutateTreeData()
      return true
    } catch (error) {
        notify({ type: 'error', message: t('operate.error.refreshTreeFailed') })
        return false
    }
  }, [mutateTreeData])

  // 创建文件夹
  const handleCreateDir = useCallback(async (parentId: string, name: string) => {
    try {
      await createDir(parentId, name)
      notify({ type: 'success', message: t('operate.success.folderCreated') })
      await mutateTreeData()
    } catch (error) {
      notify({ type: 'error', message: t('operate.error.createFolderFailed') })
    }
  }, [mutateTreeData, notify])

  // 创建文件
  const handleCreateFile = useCallback(async (
    parentId: string, 
    name: string, 
    content: string = '', 
    mimeType: string = 'text/plain'
  ) => {
    try {
      await createFile(parentId, name, content, mimeType)
      notify({ type: 'success', message: t('operate.success.fileCreated') })
      await mutateTreeData()
    } catch (error) {
      notify({ type: 'error', message: t('operate.error.createFileFailed') })
    }
  }, [mutateTreeData, notify])

  // 删除节点
  const handleDeleteNode = useCallback(async (nodeId: string, nodeName?: string) => {
    try {
      await deleteNode(nodeId)
      notify({ type: 'success', message: nodeName ? t('operate.success.nodeDeleted', { name: nodeName }) : t('operate.success.projectDeleted') })
      await mutateTreeData()
    } catch (error) {
      notify({ type: 'error', message: t('operate.error.deleteFailed') })
    }
  }, [mutateTreeData, notify])

  // 重命名节点
  const handleRenameNode = useCallback(async (nodeId: string, newName: string, oldName?: string) => {
    try {
      await renameNode(nodeId, newName)
      notify({ type: 'success', message: oldName ? t('operate.success.nodeRenamed', { name: oldName }) : t('operate.success.projectRenamed') })
      await mutateTreeData()
    } catch (error) {
      notify({ type: 'error', message: t('operate.error.renameFailed') })
    }
  }, [mutateTreeData, notify])

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