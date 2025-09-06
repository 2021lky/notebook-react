export type SupportUploadFileTypes = "image" | "document" | "audio" | "video" | "custom"

export type FileConfig = {
    allowed_file_types: SupportUploadFileTypes[];  // 允许上传的文件类型
    allowed_file_extensions: string[]; // 允许上传的文件扩展名
    fileUploadConfig: {
        image_file_size_limit: number; // 图片文件大小限制, 单位MB
        audio_file_size_limit: number; // 音频文件大小限制, 单位MB
        video_file_size_limit: number; // 视频文件大小限制, 单位MB
        document_file_size_limit: number; // 文档文件大小限制, 单位MB
        file_count_limit: number; // 文件数量限制
    };
};

export interface FileEntity {
  id: string // 文件id，前端生成，上传前可通过uuid生成唯一标识
  name: string // 文件名
  type: string // 文件类型,单位MB
  size: number // 文件大小
  progress: number // 文件上传进度
  transferMethod?: 'normal' | 'chunked' | 'resume' | 'url-import' // 传输方法，'normal'（普通单文件上传）、'chunked'（分片上传）、'resume'（断点续传）、'url-import'（通过 URL 导入远程文件）。
  supportFileType: SupportUploadFileTypes // 支持上传的文件类型
  url?: string // 文件下载链接，通常为后端返回的临时 / 永久链接
  uploadedId?: string // 后端返回，上传任务的标识，用于断点续传。
  originalFile?: File // 原始文件对象
  base64Url?: string // 文件base64编码
  status: 'success' | 'failed' | 'uploading' | 'pending' // 文件上传状态
  cancelUpload?: () => void // 可选：取消上传的函数句柄
}

export interface FileUploadOptions {
  file: FileEntity
  onProgressCallback?: (progress: number) => void // 文件上传进度回调
  onSuccessCallback?: (res?: { id: string; url: string }) => void // 文件上传成功回调
  onErrorCallback?: (error: Error) => void // 文件上传失败回调
  onStopCallback?: (cancel: () => void) => void // 中断上传，接收一个中断函数
}

export interface ChatSendOptions {
  query: string
  filesId: string[]
  onChunkCallback?: (content: string) => void
  onSuccessCallback?: () => void
  onErrorCallback?: (error: Error) => void
  onStartCallback?: (requestId: string) => void
  getAbortController?: (controller: AbortController) => void
}

export interface CustomChatSendCallback {
  onStopCallback?: () => void
  onChunkCallback?: (content: string) => void
  onSuccessCallback?: () => void
  onStartCallback?: (requestId: string) => void
  onErrorCallback?: (error: Error) => void
}