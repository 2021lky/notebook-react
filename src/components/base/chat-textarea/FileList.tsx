// 文件列表显示组件
import React from 'react'
import { FileEntity } from './types'
import { RiCloseCircleLine, RiRefreshLine } from '@remixicon/react';
import { useTranslation } from 'react-i18next'
import Toast from '@/components/base/toast'
import pdfIcon from '@/assets/pdf.png'
import wordIcon from '@/assets/word.webp'
import excelIcon from '@/assets/excel.jpeg'
import markdownIcon from '@/assets/markdown.ico'
import textIcon from '@/assets/text.webp'

interface FileListProps {
  files: FileEntity[]
  onRemove: (fileId: string) => void
  onRetry?: (fileId: string) => void
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove, onReUpload }) => {
  const { t } = useTranslation()
  if (files.length === 0) return null

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 根据文件类型获取图标
  const getFileIcon = (file: FileEntity) => {
    const extension = file.name.split('.').pop()?.toLowerCase() // 文件后缀名
    const mimeType = file.type.toLowerCase() // 文件类型

    try {
      // 根据文件扩展名或MIME类型返回对应图标
      if (mimeType.includes('pdf') || extension === 'pdf') {
        return pdfIcon
      }
      if (mimeType.includes('word') || ['doc', 'docx'].includes(extension || '')) {
        return wordIcon
      }
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || ['xls', 'xlsx'].includes(extension || '')) {
        return excelIcon
      }
      if (extension === 'md' || extension === 'markdown') {
        return markdownIcon
      }
      if (mimeType.includes('text') || ['txt', 'log'].includes(extension || '')) {
        return textIcon
      }
      
      // 默认返回文本图标
      return textIcon
    } catch (error) {
      // 如果图片加载失败，返回默认的emoji图标
      Toast.notify({ type: 'warning', message: t('operate.error.iconLoadFailed') })
      if (file.supportFileType === 'image') {
        return '🖼️'
      } else if (file.supportFileType === 'audio') {
        return '🎵'
      } else if (file.supportFileType === 'video') {
        return '🎬'
      } else {
        return '📄'
      }
    }
  }

  // 获取上传状态的样式和文本
  const getUploadStatus = (file: FileEntity) => {
    if (file.progress === -1) {
      return { 
        color: 'text-red-500', 
        text: '上传失败',
        showRetry: true 
      }
    }
    if (file.progress === 100) {
      return { 
        color: 'text-green-500', 
        text: '上传完成',
        showRetry: false 
      }
    }
    if (file.progress > 0) {
      return { 
        color: 'text-blue-500', 
        text: `上传中 ${file.progress}%`,
        showRetry: false 
      }
    }
    return { 
      color: 'text-gray-500', 
      text: '等待上传',
      showRetry: false 
    }
  }

  return (
    <div className="flex w-full flex-wrap rounded-lg">
      {files.map((file) => {
        const uploadStatus = getUploadStatus(file)
        
        return (
          <div
            key={file.id}
            className="relative w-1/2 flex items-center space-x-2 bg-white rounded-lg border shadow-sm max-w-xs"
          >
            {/* 文件图标或图片预览 */}
            <div className="flex-shrink-0">
              {file.supportFileType === 'image' && file.base64Url ? (
                // 图片预览
                <div className="relative flex items-center justify-center">
                  <img
                    src={file.base64Url}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </div>
              ) : (
                // 文件类型图标
                <div className="relative flex items-center justify-center">
                  {typeof getFileIcon(file) === 'string' && getFileIcon(file).length <= 2 ? (
                    // 如果是emoji字符
                    <div className="w-12 h-12 flex items-center justify-center text-2xl bg-gray-100 rounded">
                      {getFileIcon(file)}
                    </div>
                  ) : (
                    // 如果是图片路径
                    <img
                      src={getFileIcon(file)}
                      alt={`${file.supportFileType} file`}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        // 图片加载失败时显示默认图标
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-12 h-12 flex items-center justify-center text-2xl bg-gray-100 rounded">📄</div>';
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* 文件信息 */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                {file.name}
              </div>
              <div className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </div>
              <div className={`text-xs ${uploadStatus.color}`}>
                {uploadStatus.text}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col space-y-1">
              {/* 删除按钮 */}
              <RiCloseCircleLine
                onClick={() => onRemove(file.id)}
                className="w-4 h-4 cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
              />

              {/* 重试按钮 */}
              {uploadStatus.showRetry && onRetry && (
                <button
                  onClick={() => onRetry(file.id)}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  title="重新上传"
                >
                  <RiRefreshLine className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}