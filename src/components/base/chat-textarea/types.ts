// 聊天框相关类型定义
export interface FileEntity {
  id: string // 文件id
  name: string // 文件名
  type: string // 文件类型
  size: number // 文件大小
  progress: number // 文件上传进度
  transferMethod?: string // 传输方法
  supportFileType: string // 支持上传的文件类型
  url?: string // 文件下载链接
  uploadedId?: string // 文件上传id
  originalFile?: File // 原始文件
  isRemote?: boolean // 是否是远程文件
  base64Url?: string // 文件base64编码
}

// 音频录音接口
export interface AudioRecording {
  id: string // 录音id
  blob: Blob // 录音文件
  transcription: string // 录音文本
  duration: number // 录音时长
  createdAt: Date // 录音创建时间
}

// 文件上传配置接口
export interface FileUploadConfig {
  image_file_size_limit?: number // 图片文件大小限制
  file_size_limit?: number // 文件大小限制
  audio_file_size_limit?: number // 音频文件大小限制
  video_file_size_limit?: number // 视频文件大小限制
  workflow_file_upload_limit?: number // 工作流文件上传限制
}

// 文件上传接口
export interface FileUpload {
  allowed_file_types?: string[] // 允许上传的文件类型
  allowed_file_extensions?: string[] // 允许上传的文件扩展名
  fileUploadConfig?: FileUploadConfig // 文件上传配置
}

// 支持上传的文件类型
export enum SupportUploadFileTypes {
  image = 'image',
  document = 'document', 
  audio = 'audio',
  video = 'video',
  custom = 'custom'
}

// 传输方法
export enum TransferMethod {
  local_file = 'local_file', // 本地文件
  remote_url = 'remote_url' // 远程url
}

// 文件上传选项接口
export interface FileUploadOptions {
  file: File
  onProgressCallback?: (progress: number) => void // 文件上传进度回调
  onSuccessCallback?: (res: { id: string; url: string }) => void // 文件上传成功回调
  onErrorCallback?: () => void // 文件上传失败回调
}

// 基础聊天框属性接口
interface BaseChatTextAreaProps {
  value?: string // 聊天框值
  onChange?: (value: string) => void // 聊天框值改变回调
  onSend?: (content: string, files?: FileEntity[]) => void // 发送消息回调
  placeholder?: string // 占位符
  disabled?: boolean // 是否禁用
  fileConfig?: FileUpload // 文件上传配置
  maxLength?: number // 最大输入长度
  isStreaming?: boolean // 是否正在流式输出（由父组件传入以保持通用性）
  onStop?: () => void // 停止流式输出回调（由父组件传入以保持通用性）
}

// 当启用文件上传或语音输入时，onFileUpload 必须提供
type ChatTextAreaPropsWithUpload = BaseChatTextAreaProps & {
  enableVoiceInput: true
  enableFileUpload?: boolean
  onFileUpload: (options: FileUploadOptions, isPublic?: boolean) => void
} | BaseChatTextAreaProps & {
  enableFileUpload: true
  enableVoiceInput?: boolean
  onFileUpload: (options: FileUploadOptions, isPublic?: boolean) => void
}

// 当两者都禁用时，onFileUpload 可选
type ChatTextAreaPropsWithoutUpload = BaseChatTextAreaProps & {
  enableVoiceInput?: false
  enableFileUpload?: false
  onFileUpload?: (options: FileUploadOptions, isPublic?: boolean) => void
}

// 聊天框属性接口 - 使用联合类型确保类型安全
export type ChatTextAreaProps = ChatTextAreaPropsWithUpload | ChatTextAreaPropsWithoutUpload