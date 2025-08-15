// 文件上传相关工具函数
import { SupportUploadFileTypes } from '../types'
import Toast from '@/components/base/toast'
import i18n from '@/i18n/i18next-config'

// 模拟文件上传函数
export const fileUpload = async (
  options: {
    file: File
    onProgressCallback?: (progress: number) => void
    onSuccessCallback?: (res: { id: string; url: string }) => void
    onErrorCallback?: () => void
  },
  isPublic?: boolean
) => {
  const { file, onProgressCallback, onSuccessCallback, onErrorCallback } = options
  
  try {
    // 模拟上传进度
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      onProgressCallback?.(progress)
      
      if (progress >= 100) {
        clearInterval(interval)
        // 模拟成功响应
        onSuccessCallback?.({
          id: `file_${Date.now()}`,
          url: URL.createObjectURL(file)
        })
      }
    }, 100)
  } catch (error) {
    Toast.notify({ type: 'error', message: i18n.t('operate.error.fileUploadSimulateFailed') })
    onErrorCallback?.()
  }
}

// 获取文件支持类型
export const getSupportFileType = (fileName: string, mimeType: string, allowCustom?: boolean): string => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const documentTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3']
  const videoTypes = ['video/mp4', 'video/avi', 'video/mov']

  if (imageTypes.includes(mimeType)) return SupportUploadFileTypes.image
  if (documentTypes.includes(mimeType)) return SupportUploadFileTypes.document
  if (audioTypes.includes(mimeType)) return SupportUploadFileTypes.audio
  if (videoTypes.includes(mimeType)) return SupportUploadFileTypes.video
  
  return allowCustom ? SupportUploadFileTypes.custom : SupportUploadFileTypes.document
}

// 检查文件扩展名是否允许
export const isAllowedFileExtension = (
  fileName: string,
  mimeType: string,
  allowedTypes: string[],
  allowedExtensions: string[]
): boolean => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase()
  const supportType: string = getSupportFileType(fileName, mimeType)
  
  return allowedTypes.includes(supportType) || 
         (fileExtension !== undefined && allowedExtensions.includes(fileExtension))
}

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 模拟远程文件信息获取
export const uploadRemoteFileInfo = async (url: string, isPublic?: boolean) => {
  // 模拟API调用
  return new Promise<{
    id: string
    name: string
    mime_type: string
    size: number
    url: string
  }>((resolve, reject) => {
    setTimeout(() => {
      try {
        const fileName = url.split('/').pop() || 'unknown'
        resolve({
          id: `remote_${Date.now()}`,
          name: fileName,
          mime_type: 'application/octet-stream',
          size: Math.floor(Math.random() * 1000000),
          url
        })
      } catch {
        reject(new Error('Failed to fetch remote file info'))
      }
    }, 1000)
  })
}