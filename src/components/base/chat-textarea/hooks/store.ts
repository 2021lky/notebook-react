// 简化的文件存储hook
import { useState, useCallback, useRef } from 'react'
import { FileEntity } from '../types'

interface FileStore {
  files: FileEntity[] // 文件列表
  setFiles: (files: FileEntity[] | ((prevFiles: FileEntity[]) => FileEntity[])) => void // 设置文件列表，支持函数式更新
  addFile: (file: FileEntity) => void // 添加文件
  removeFile: (fileId: string) => void // 移除文件
  updateFile: (file: FileEntity) => void // 更新文件
}

export const useFileStore = (): FileStore => {
  const [files, setFiles] = useState<FileEntity[]>([])

  const addFile = useCallback((file: FileEntity) => {
    setFiles(prevFiles => [...prevFiles, file])
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId))
  }, [])

  const updateFile = useCallback((file: FileEntity) => {
    setFiles(prevFiles => prevFiles.map(f => f.id === file.id ? file : f))
  }, [])

  const setFilesCallback = useCallback((newFiles: FileEntity[] | ((prevFiles: FileEntity[]) => FileEntity[])) => {
    setFiles(newFiles)
  }, [])

  return {
    files,
    setFiles: setFilesCallback,
    addFile,
    removeFile,
    updateFile
  }
}