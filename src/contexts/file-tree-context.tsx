'use client'
import { createContext, useContext, ReactNode } from 'react'
import useSWR, { KeyedMutator } from 'swr'
import { TreeNodeData } from '@/components/Home/left/index'
import { getFileTree } from '@/service/fileSystem'

interface FileTreeContextType {
  treeData: TreeNodeData[] | undefined
  mutateTreeData: KeyedMutator<TreeNodeData[]>
  isLoading: boolean
}

const FileTreeContext = createContext<FileTreeContextType | undefined>(undefined)

interface FileTreeProviderProps {
  children: ReactNode
}
export function FileTreeProvider({ 
  children
}: FileTreeProviderProps) {
  const { data: treeData, mutate: mutateTreeData, isLoading } = useSWR(
    ['fileTree'],
    () => getFileTree().then((res) => res.data)
  )

  const contextValue: FileTreeContextType = {
    treeData,
    mutateTreeData,
    isLoading
  }

  return (
    <FileTreeContext.Provider value={contextValue}>
      {children}
    </FileTreeContext.Provider>
  )
}

export function useFileTree(): FileTreeContextType {
  const context = useContext(FileTreeContext)
  if (context === undefined) {
    throw new Error('useFileTree must be used within a FileTreeProvider')
  }
  return context
}