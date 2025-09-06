import { FileEntity, FileConfig, SupportUploadFileTypes } from '../types'
import Toast from '@/components/base/Toast'

// 格式化文件大小
export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取上传状态的样式和文本
export const getUploadStatus = (file: FileEntity) => {
    if (file.progress === -1) {
        return {
            color: 'text-error',
            text: '上传失败',
            showRetry: true
        }
    }
    if (file.progress === 100) {
        return {
            color: 'text-success',
            text: '上传完成',
            showRetry: false
        }
    }
    if (file.progress > 0) {
        return {
            color: 'text-primary',
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

export const uuid4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 获取文件类型
export const getSupportFileType = (mimeType: string, fileName?: string): SupportUploadFileTypes => {
  
  const mt = (mimeType || '').toLowerCase().split(';')[0].trim();

  // 直接按大类识别
  if (/^image\//.test(mt)) return 'image';
  if (/^audio\//.test(mt)) return 'audio';
  if (/^video\//.test(mt)) return 'video';

  // 文本类统一算文档
  if (/^text\//.test(mt)) return 'document';

  // application/* 的常见文档子类型（通过关键词/子类型匹配）
  const docPatterns = [
    /pdf/, // application/pdf
    /msword|wordprocessingml/, // doc docx
    /vnd\.ms-excel|spreadsheetml|excel|xlsx|xls|csv/, // xls xlsx csv
    /vnd\.ms-powerpoint|presentationml|powerpoint|pptx|ppt/, // ppt pptx
    /rtf|richtext/, // rtf
    /vnd\.oasis\.opendocument|opendocument|odt|ods|odp/, // odt ods odp
    /markdown|md/, // text/markdown 或 application/markdown
  ];
  if (/^application\//.test(mt) && docPatterns.some(rx => rx.test(mt))) {
    return 'document';
  }

  // 兜底：按扩展名识别（当 mimeType 为空/非标准）
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg','jpeg','png','gif','webp','bmp','svg','heic','heif','ico','tiff','tif','avif'].includes(ext)) {
      return 'image';
    }
    if (['mp3','wav','ogg','flac','aac','m4a','amr','oga'].includes(ext)) {
      return 'audio';
    }
    if (['mp4','webm','ogg','mov','avi','mkv','wmv','flv','m4v'].includes(ext)) {
      return 'video';
    }
    if (['pdf','doc','docx','rtf','txt','md','odt','xls','xlsx','csv','ppt','pptx','odp','ods'].includes(ext)) {
      return 'document';
    }
  }

  return 'custom';
}

// 检查文件后缀名和文件类型是否同时允许
export const isAllowedFileExtension = (
  fileName: string,
  mimeType: string,
  allowedTypes: string[],
  allowedExtensions: string[],
  supportFileType?: SupportUploadFileTypes
): boolean => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase()  // 获取文件扩展名
  const supportType: string = supportFileType || getSupportFileType(mimeType, fileName)  // 获取文件类型
  // 检查文件类型是否允许
  if(!allowedTypes.includes(supportType)) {
    Toast.notify({ type: 'error', message: '文件类型不支持' })
    return false
  }
  // 检查文件后缀名是否允许
  if(fileExtension !== undefined && !allowedExtensions.includes(fileExtension)) {
    Toast.notify({ type: 'error', message: '文件后缀名不支持' })
    return false
  }
  return true
}

export const isUpLoadAllow = (fileConfig: FileConfig, file: FileEntity) => {
    const supportType: string = file.supportFileType || getSupportFileType(file.type)
    // 检查文件数量
    if(fileConfig.fileUploadConfig.file_count_limit <= 0) {
        return false
    }
    // 检查文件大小
    switch (supportType) {
        case 'image':
            if(file.size > fileConfig.fileUploadConfig.image_file_size_limit * 1024 * 1024) {
                Toast.notify({ type: 'error', message: '图片文件大小超出限制' })
                return false
            }
            break
        case 'audio':
            if(file.size > fileConfig.fileUploadConfig.audio_file_size_limit * 1024 * 1024) {
                Toast.notify({ type: 'error', message: '音频文件大小超出限制' })
                return false
            }
            break
        case 'video':
            if(file.size > fileConfig.fileUploadConfig.video_file_size_limit * 1024 * 1024) {
                Toast.notify({ type: 'error', message: '视频文件大小超出限制' })
                return false
            }
            break
        case 'document':
            if(file.size > fileConfig.fileUploadConfig.document_file_size_limit * 1024 * 1024) {
                Toast.notify({ type: 'error', message: '文档文件大小超出限制' })
                return false
            }
            break
        default:
            return false
    }

    // 检查后缀和文件类型
    if(!isAllowedFileExtension(file.name, file.type, fileConfig.allowed_file_types, fileConfig.allowed_file_extensions, supportType)) {
        return false
    }
    return true
}