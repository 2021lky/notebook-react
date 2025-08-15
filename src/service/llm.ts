import { get, post } from "./base"
import { tokenManager } from "./fetch"
import { API_PREFIX } from "@/constant"
import Toast from "@/components/base/toast"
import i18n from '@/i18n/i18next-config'

export type Modal = {
    id: string;
    name: string;
    description: string;
}

export type ChatMessage = {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export type ChatRequest = {
    messages: ChatMessage[];
    model?: string;
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
}

// 流式输出专用类型定义
export type StreamChunk = {
    choices: Array<{
        delta: {
            content?: string;
        };
    }>;
};

export const getModalList = () => {
    return get('llm/models').json().then(res => {
        return res as Modal[]
    })
}

// 流式响应处理函数
export const chatStream = async (
    params: ChatRequest,
    onChunk: (content: string) => void,
    onComplete: (fullContent: string) => void,
    onError: (error: Error) => void,
    onStart?: (requestId?: string) => void
): Promise<void> => {
    try {
        const response = await post('llm/chat', params)
        
        // 检查响应是否成功
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        // 优先从响应头尝试获取 requestId 并尽早通知
        let requestId: string | undefined =
          response.headers?.get('x-request-id') || response.headers?.get('X-Request-Id') || undefined
        if (onStart) {
          onStart(requestId)
        }

        // 对于流式响应，我们需要读取流数据
        const reader = response.body?.getReader()
        if (!reader) {
            throw new Error('Response body is not readable')
        }
        
        const decoder = new TextDecoder()
        let fullContent = ''
        
        try {
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                
                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim()
                        if (data === '[DONE]') {
                            onComplete(fullContent)
                            return
                        }
                        try {
                            const parsed = JSON.parse(data)
                            // 如果首个数据块里带有 requestId，且之前未拿到，则补充通知
                            if (!requestId && parsed.requestId && onStart) {
                              requestId = parsed.requestId
                              onStart(requestId)
                            }
                            // 处理每个流式数据块
                            if (parsed.choices?.[0]?.delta?.content) {
                                const content = parsed.choices[0].delta.content
                                fullContent += content
                                onChunk(content)
                            }
                        } catch (e) {
                            // 忽略无法解析的数据块
                            console.warn('Failed to parse SSE data:', data)
                        }
                    }
                }
            }
            
            // 如果没有收到[DONE]信号，也要调用完成回调
            onComplete(fullContent)
        } finally {
            reader.releaseLock()
        }
    } catch (error) {
        onError(error instanceof Error ? error : new Error('Unknown error'))
    }
}

// 创建支持文件上传的客户端，集成token管理
const createUploadClient = () => {
  
  return {
    async uploadWithProgress(
      url: string,
      formData: FormData,
      onProgress?: (progress: number) => void
    ): Promise<any> {
      return new Promise(async (resolve, reject) => {
        let accessToken = tokenManager.getAccessToken()
        
        const performUpload = async (token: string | null, isRetry = false) => {
          const xhr = new XMLHttpRequest()
          
          // 监听上传进度
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100)
              onProgress?.(progress)
            }
          })
          
          // 监听请求完成
          xhr.addEventListener('load', async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText)
                resolve(response)
              } catch (error) {
                reject(new Error('响应解析失败'))
              }
            } else if (xhr.status === 401 && !isRetry) {
              // Token过期，尝试刷新
              try {
                // 文件上传遇到401错误，尝试刷新token
                const newToken = await tokenManager.refreshAccessToken()
                // 使用新token重试上传
                performUpload(newToken, true)
              } catch (refreshError) {
                Toast.notify({ type: 'error', message: i18n.t('operate.error.tokenRefreshFailed') })
                reject(new Error(`认证失败: ${xhr.status}`))
              }
            } else {
              reject(new Error(`HTTP错误: ${xhr.status}`))
            }
          })
          
          // 监听请求错误
          xhr.addEventListener('error', () => {
            reject(new Error('网络错误'))
          })
          
          // 监听请求超时
          xhr.addEventListener('timeout', () => {
            reject(new Error('请求超时'))
          })
          
          // 设置超时时间（30秒）
          xhr.timeout = 30000
          
          // 设置请求头
          xhr.open('POST', `${API_PREFIX}/${url}`)
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
          }
          
          // 发送请求
          xhr.send(formData)
        }
        
        // 开始上传
        performUpload(accessToken)
      })
    }
  }
}

export const fetchFileUpload = async (
  file: File, 
  options?: {
    onProgress?: (progress: number) => void
    onSuccess?: (response: any) => void
    onError?: (error: Error) => void
  }
) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const uploadClient = createUploadClient()
    
    const response = await uploadClient.uploadWithProgress(
      'upload/file',
      formData,
      options?.onProgress
    )
    
    options?.onSuccess?.(response)
    return response
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('上传失败')
    Toast.notify({ type: 'error', message: i18n.t('operate.error.fileUploadFailed') })
    options?.onError?.(errorObj)
    throw errorObj
  }
}

/**
 * @route POST /api/llm/stop
 * @desc 停止正在进行中的回答（需要携带requestId，或传stopAll=true停止当前用户的所有请求）
 * @access Private
 * @body {
 *   requestId?: string,
 *   stopAll?: boolean
 * }
 */
export const stopChat = async (params: {
  requestId?: string,
  stopAll?: boolean
}) => {
  return await post('llm/stop', params).json()
}