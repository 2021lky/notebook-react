// 文件图片上传钩子
import type { ClipboardEvent } from 'react'  // 复制事件类型
import {
  useCallback,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useFileStore } from './store'
import {
  getSupportFileType,
  isAllowedFileExtension,
  formatFileSize,
  uploadRemoteFileInfo,
} from './utils'
import { 
  FileEntity, 
  FileUpload, 
  FileUploadConfig, 
  SupportUploadFileTypes, 
  TransferMethod,
  FileUploadOptions,
} from '../types'

// 简化的通知函数
const useToastContext = () => ({
  notify: ({ type, message }: { type: string; message: string }) => {
    console.log(`${type}: ${message}`)
    // 这里可以集成真实的通知系统
  }
})



// 简化的参数hook
const useParams = () => ({ token: null, appId: null })

// 简单的UUID生成函数
const uuid4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const AUDIO_SIZE_LIMIT = 5*1024 * 1024 // 5MB
const FILE_SIZE_LIMIT = 5*1024 * 1024 // 5MB
const IMG_SIZE_LIMIT = 5*1024 * 1024 // 5MB
const MAX_FILE_UPLOAD_LIMIT = 5*1024 * 1024 // 5MB
const VIDEO_SIZE_LIMIT = 5*1024 * 1024 // 5MB

export const useFileSizeLimit = (fileUploadConfig?: FileUploadConfig) => {
  const imgSizeLimit = Number(fileUploadConfig?.image_file_size_limit) * 1024 * 1024 || IMG_SIZE_LIMIT  // 限制图片大小
  const docSizeLimit = Number(fileUploadConfig?.file_size_limit) * 1024 * 1024 || FILE_SIZE_LIMIT  // 限制文件大小
  const audioSizeLimit = Number(fileUploadConfig?.audio_file_size_limit) * 1024 * 1024 || AUDIO_SIZE_LIMIT  // 限制音频大小
  const videoSizeLimit = Number(fileUploadConfig?.video_file_size_limit) * 1024 * 1024 || VIDEO_SIZE_LIMIT  // 限制视频大小
  const maxFileUploadLimit = Number(fileUploadConfig?.workflow_file_upload_limit) || MAX_FILE_UPLOAD_LIMIT  // 限制文件上传数量

  return {
    imgSizeLimit,
    docSizeLimit,
    audioSizeLimit,
    videoSizeLimit,
    maxFileUploadLimit,
  }
}

// useFile hook 参数接口
interface UseFileParams {
  fileConfig: FileUpload
  enableFileUpload?: boolean
  onFileUpload?: (options: FileUploadOptions, isPublic?: boolean) => void
}

export const useFile = ({
  fileConfig,
  enableFileUpload = false, // 标识是否启用文件上传
  onFileUpload, // 上传文件回调
}: UseFileParams) => {
  const { t } = useTranslation()
  const { notify } = useToastContext()
  const params = useParams()
  const fileStore = useFileStore() // 将 useFileStore 调用移到顶层
  const { imgSizeLimit, docSizeLimit, audioSizeLimit, videoSizeLimit } = useFileSizeLimit(fileConfig.fileUploadConfig)

  // 检查是否启用文件上传且提供了上传回调
  const isFileUploadEnabled = enableFileUpload && !!onFileUpload
  
  // 检查文件大小是否超出限制
  const checkSizeLimit = useCallback((fileType: string, fileSize: number) => {
    switch (fileType) {
      case SupportUploadFileTypes.image: {
        if (fileSize > imgSizeLimit) {
          notify({
            type: 'error',
            message: t('common.fileUploader.uploadFromComputerLimit', {
              size: formatFileSize(imgSizeLimit),
            }),
          })
          return false
        }
        return true
      }
      case SupportUploadFileTypes.document: {
        if (fileSize > docSizeLimit) {
          notify({
            type: 'error',
            message: t('common.fileUploader.uploadFromComputerLimit', {
              size: formatFileSize(docSizeLimit),
            }),
          })
          return false
        }
        return true
      }
      case SupportUploadFileTypes.audio: {
        if (fileSize > audioSizeLimit) {
          notify({
            type: 'error',
            message: t('common.fileUploader.uploadFromComputerLimit', {
              size: formatFileSize(audioSizeLimit),
            }),
          })
          return false
        }
        return true
      }
      case SupportUploadFileTypes.video: {
        if (fileSize > videoSizeLimit) {
          notify({
            type: 'error',
            message: t('common.fileUploader.uploadFromComputerLimit', {
              size: formatFileSize(videoSizeLimit),
            }),
          })
          return false
        }
        return true
      }
      case SupportUploadFileTypes.custom: {
        if (fileSize > docSizeLimit) {
          notify({
            type: 'error',
            message: t('common.fileUploader.uploadFromComputerLimit', {
              size: formatFileSize(docSizeLimit),
            }),
          })
          return false
        }
        return true
      }
      default: {
        return true
      }
    }
  }, [audioSizeLimit, docSizeLimit, imgSizeLimit, notify, t, videoSizeLimit])

  // 添加文件
  const handleAddFile = useCallback((newFile: FileEntity) => {
    fileStore.addFile(newFile)
  }, [fileStore])

  // 更新文件 - 优化版本，支持异步状态更新
  const handleUpdateFile = useCallback((newFile: FileEntity) => {
    // 使用函数式更新来确保基于最新状态进行更新
    fileStore.setFiles(prevFiles => {
      const foundFile = prevFiles.find(file => file.id === newFile.id)
      if (!foundFile) {
        // 如果找不到文件，可能是因为异步问题，尝试添加该文件
        return [...prevFiles, newFile]
      }
      return prevFiles.map(f => f.id === newFile.id ? newFile : f)
    })
  }, [fileStore])

  // 删除文件
  const handleRemoveFile = useCallback((fileId: string) => {
    fileStore.removeFile(fileId)
  }, [fileStore])

  // 重新上传文件
  const handleReUploadFile = useCallback((fileId: string) => {
    if (!isFileUploadEnabled || !onFileUpload) {
      notify({ type: 'error', message: t('common.fileUploader.uploadFromComputerUploadError') })
      return
    }

    const currentFiles = fileStore.files
    const index = currentFiles.findIndex(file => file.id === fileId)

    if (index > -1) {
      const uploadingFile = currentFiles[index]
      
      // 创建一个可变的引用来跟踪当前文件状态
      let currentFileRef: FileEntity = { ...uploadingFile, progress: 0 }
      
      // 重置进度为0
      handleUpdateFile(currentFileRef)
      
      onFileUpload({
          file: uploadingFile.originalFile!,
          onProgressCallback: (progress) => {
            // 更新进度，确保进度值在0-100之间
            const normalizedProgress = Math.min(Math.max(progress, 0), 100)
            currentFileRef = { ...currentFileRef, progress: normalizedProgress }
            handleUpdateFile(currentFileRef)
          },
          onSuccessCallback: (res) => {
            // 更新成功状态
            currentFileRef = { 
              ...currentFileRef, 
              uploadedId: res.id, 
              progress: 100,
              url: res.url || currentFileRef.url // 如果返回了URL则更新
            }
            handleUpdateFile(currentFileRef)
          },
          onErrorCallback: () => {
            notify({ type: 'error', message: t('common.fileUploader.uploadFromComputerUploadError') })
            // 更新错误状态
            currentFileRef = { ...currentFileRef, progress: -1 }
            handleUpdateFile(currentFileRef)
          },
        }, !!params.token)
    }
  }, [isFileUploadEnabled, onFileUpload, handleUpdateFile, notify, t, params.token])

  // 开始上传进度定时器
  const startProgressTimer = useCallback((fileId: string) => {
    const timer = setInterval(() => {
      const files = fileStore.files
      const file = files.find(file => file.id === fileId)

      if (file && file.progress < 80 && file.progress >= 0)
        handleUpdateFile({ ...file, progress: file.progress + 20 })
      else
        clearInterval(timer)
    }, 200)
  }, [fileStore, handleUpdateFile])

  // 从链接加载文件
  const handleLoadFileFromLink = useCallback((url: string) => {
    const allowedFileTypes = fileConfig.allowed_file_types

    const uploadingFile = {
      id: uuid4(),
      name: url,
      type: '',
      size: 0,
      progress: 0,
      transferMethod: TransferMethod.remote_url,
      supportFileType: '',
      url,
      isRemote: true,
    }
    handleAddFile(uploadingFile)
    startProgressTimer(uploadingFile.id)
    // 下载网络文件
    uploadRemoteFileInfo(url, !!params.token).then((res) => {
      const newFile = {
        ...uploadingFile,
        name: res.name,
        type: res.mime_type,
        size: res.size,
        progress: 100,
        supportFileType: getSupportFileType(res.name, res.mime_type, allowedFileTypes?.includes(SupportUploadFileTypes.custom)),
        uploadedId: res.id,
        url: res.url,
      }
      if (!isAllowedFileExtension(res.name, res.mime_type, fileConfig.allowed_file_types || [], fileConfig.allowed_file_extensions || [])) {
        notify({ type: 'error', message: t('common.fileUploader.fileExtensionNotSupport') })
        handleRemoveFile(uploadingFile.id)
        return
      }
      if (!checkSizeLimit(newFile.supportFileType, newFile.size)) {
        handleRemoveFile(uploadingFile.id)
        return
      }
      handleUpdateFile(newFile)
    }).catch(() => {
      notify({ type: 'error', message: t('common.fileUploader.pasteFileLinkInvalid') })
      handleRemoveFile(uploadingFile.id)
    })
  }, [checkSizeLimit, handleAddFile, handleUpdateFile, notify, t, handleRemoveFile, fileConfig.allowed_file_types, fileConfig.allowed_file_extensions, startProgressTimer, params.token])

  // 清除所有文件
  const handleClearFiles = useCallback(() => {
    fileStore.setFiles([])
  }, [fileStore])

  // 本地文件上传
  const handleLocalFileUpload = useCallback((file: File) => {
    // 检查是否启用文件上传且提供了上传回调
    if (!isFileUploadEnabled || !onFileUpload) {
      notify({ type: 'error', message: t('common.fileUploader.uploadFromComputerUploadError') })
      return
    }

    // 检查文件扩展名是否支持
    if (!isAllowedFileExtension(file.name, file.type, fileConfig.allowed_file_types || [], fileConfig.allowed_file_extensions || [])) {
      notify({ type: 'error', message: t('common.fileUploader.fileExtensionNotSupport') })
      return
    }
    // 检查文件大小是否超出限制
    const allowedFileTypes = fileConfig.allowed_file_types
    const fileType = getSupportFileType(file.name, file.type, allowedFileTypes?.includes(SupportUploadFileTypes.custom))
    if (!checkSizeLimit(fileType, file.size))
      return
    
    // 文件的预读取
    const reader = new FileReader()
    const isImage = file.type.startsWith('image')

    reader.addEventListener(
      'load',
      () => {
        const uploadingFile = {
          id: uuid4(),
          name: file.name,
          type: file.type,
          size: file.size,
          progress: 0,
          transferMethod: TransferMethod.local_file,
          supportFileType: getSupportFileType(file.name, file.type, allowedFileTypes?.includes(SupportUploadFileTypes.custom)),
          originalFile: file,
          base64Url: isImage ? reader.result as string : '',
          url: undefined, // 初始化为undefined
          uploadedId: undefined, // 初始化为undefined
          isRemote: false, // 本地文件
        }
        
        // 使用更可靠的方式处理文件上传状态管理
        // 先将文件添加到列表中，然后使用回调确保状态已更新
        fileStore.setFiles(prevFiles => {
          const newFiles = [...prevFiles, uploadingFile]
          
          // 在状态更新后立即开始上传
          setTimeout(() => {
            onFileUpload!({
              file: uploadingFile.originalFile,
              onProgressCallback: (progress) => {
                // 更新进度，确保进度值在0-100之间
                const normalizedProgress = Math.min(Math.max(progress, 0), 100)
                const updatedFile = { ...uploadingFile, progress: normalizedProgress }
                handleUpdateFile(updatedFile)
              },
              onSuccessCallback: (res) => {
                // 更新成功状态
                const updatedFile = { 
                  ...uploadingFile, 
                  uploadedId: res.id, 
                  progress: 100,
                  url: res.url || uploadingFile.url // 如果返回了URL则更新
                }
                handleUpdateFile(updatedFile)
              },
              onErrorCallback: () => {
                notify({ type: 'error', message: t('common.fileUploader.uploadFromComputerUploadError') })
                // 更新错误状态
                const updatedFile = { ...uploadingFile, progress: -1 }
                handleUpdateFile(updatedFile)
              },
            }, !!params.token)
          }, 0)
          
          return newFiles
        })
      },
      false,
    )
    
    // 读取文件失败
    reader.addEventListener(
      'error',
      () => {
        notify({ type: 'error', message: t('common.fileUploader.uploadFromComputerReadError') })
      },
      false,
    )
    
    reader.readAsDataURL(file)
  }, [isFileUploadEnabled, onFileUpload, checkSizeLimit, handleAddFile, handleUpdateFile, fileConfig.allowed_file_types, fileConfig.allowed_file_extensions, notify, t, params.token])

  const handleSelectFile = useCallback((file: File) => {
    handleLocalFileUpload(file)
  }, [handleLocalFileUpload])

  const handleClipboardPasteFile = useCallback((e: ClipboardEvent<HTMLTextAreaElement>) => {
    const file = e.clipboardData?.files[0]
    if (file) {
      e.preventDefault()
      handleLocalFileUpload(file)
    }
  }, [handleLocalFileUpload])

  // 处理文件拖拽事件
  const [isDragActive, setIsDragActive] = useState(false)
  const handleDragFileEnter = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if(enableFileUpload)
      setIsDragActive(true)
  }, [enableFileUpload])

  const handleDragFileOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragFileLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if(enableFileUpload)
      setIsDragActive(false)
  }, [enableFileUpload])

  const handleDropFile = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if(enableFileUpload)
      setIsDragActive(false)

    // 选择粘贴板中的第一个文件
    const file = e.dataTransfer.files[0]

    if (enableFileUpload && file)
      handleLocalFileUpload(file)
  }, [enableFileUpload, handleLocalFileUpload])


  return {
    fileStore, // 返回fileStore实例
    handleAddFile,
    handleUpdateFile,
    handleRemoveFile,
    handleReUploadFile,
    handleLoadFileFromLink,
    handleClearFiles,
    handleSelectFile,
    handleLocalFileUpload,
    handleClipboardPasteFile,
    isDragActive,
    handleDragFileEnter,
    handleDragFileOver,
    handleDragFileLeave,
    handleDropFile,
  }
}