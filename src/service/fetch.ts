import type { AfterResponseHook, BeforeErrorHook, BeforeRequestHook, Hooks } from 'ky'
import ky from 'ky'
import { API_PREFIX } from '@/constant'
import Toast from '@/components/base/toast'
import i18n from '@/i18n/i18next-config'

const TIME_OUT = 100000

// 标识网络传输中数据的格式
export const ContentType = {
  json: 'application/json',
  stream: 'text/event-stream',
  audio: 'audio/mpeg',
  form: 'application/x-www-form-urlencoded; charset=UTF-8',
  download: 'application/octet-stream', // for download
  downloadZip: 'application/zip', // for download
  upload: 'multipart/form-data', // for upload
}

// 定义请求参数类型
export type FetchOptionType = Omit<RequestInit, 'body'> & {
  params?: Record<string, any>
  body?: BodyInit | Record<string, any> | null
}

export type ResponseError = {
  code: string
  message: string
  status: number
}

// Token管理类
class TokenManager {
  private static instance: TokenManager
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private isRefreshing = false  // 标识是否为刷新请求
  private refreshPromise: Promise<string> | null = null  // 唯一化的刷新请求实例

  private constructor() {
    this.loadTokensFromStorage()
  }
  // 单例模式
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  // 从localStorage加载token
  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('access_token')
    this.refreshToken = localStorage.getItem('refresh_token')
  }

  // 保存token到localStorage
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }

  // 获取访问token
  getAccessToken(): string | null {
    return this.accessToken
  }

  // 获取刷新token
  getRefreshToken(): string | null {
    return this.refreshToken
  }

  // 清除所有token
  clearTokens() {
    // Clearing tokens from localStorage
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  // 刷新token
  async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh()

    try {
      const newAccessToken = await this.refreshPromise
      this.isRefreshing = false
      this.refreshPromise = null
      return newAccessToken
    } catch (error) {
      this.isRefreshing = false
      this.refreshPromise = null
      throw error
    }
  }

  // 执行token刷新请求
  private async performTokenRefresh(): Promise<string> {
    try {
      const response = await fetch(`${API_PREFIX}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken
        })
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      // Token refresh completed
      if (data.status === "success" && data.data) {
        const { accessToken, refreshToken } = data.data
        this.setTokens(accessToken, refreshToken || this.refreshToken!)
        return accessToken
      } else {
        throw new Error(data.message || 'Token refresh failed')
      }
    } catch (error) {
      // 刷新失败，清除所有token并跳转到登录页
      Toast.notify({ type: 'error', message: i18n.t('operate.error.tokenRefreshFailed') })
      this.clearTokens()
      window.location.href = '/signin'
      throw error
    }
  }
}

// 获取token管理器实例
const tokenManager = TokenManager.getInstance()

// 请求拦截器 - 添加Authorization头
const beforeRequestAuth: BeforeRequestHook = async (request) => {
  const accessToken = tokenManager.getAccessToken()
  if (accessToken) {
    request.headers.set('Authorization', `Bearer ${accessToken}`)
  }
}

// 响应拦截器 - 处理204状态码
const afterResponse204: AfterResponseHook = async (_request, _options, response) => {
  if (response.status === 204) {
    return Response.json({ result: 'success' })
  }
}

// 响应拦截器 - 自动处理token存储（登录成功后）
const afterResponseTokenHandler: AfterResponseHook = async (_, _options, response) => {
  if (response.ok) {
    // 只对JSON响应进行token提取，避免处理流式响应
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      try {
        const clonedResponse = response.clone()
        const data = await clonedResponse.json()
        
        // 检查响应中是否包含token信息
        if (data && data.data && data.data.accessToken && data.data.refreshToken) {
          // 自动存储token到localStorage
          tokenManager.setTokens(data.data.accessToken, data.data.refreshToken)
          // Tokens automatically saved to localStorage
        }
      } catch (error) {
        // JSON解析失败，忽略错误继续处理
        // Failed to parse response for token extraction
      }
    }
  }
  
  return response
}

// 创建一个不包含401处理拦截器的客户端，用于重试请求，避免循环调用
let retryClient: typeof ky

// 响应拦截器 - 处理token过期和错误
const afterResponseErrorHandler: AfterResponseHook = async (request, options,  response) => {
  const clonedResponse = response.clone()
  // 处理401未授权错误（token过期）
  if (clonedResponse.status === 401) {
    try {
      // 401 Unauthorized - attempting token refresh
      // 尝试刷新token
      const newAccessToken = await tokenManager.refreshAccessToken()
      
      // 使用新token重新发送原始请求
      // 创建新的请求选项，包含新的Authorization头
      const newOptions = {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newAccessToken}`
        }
      }
      
      const apiPrefixIndex = request.url.indexOf(API_PREFIX)
      let url = ''
      
      if (apiPrefixIndex !== -1) {
        // 找到API_PREFIX，提取其后面的部分
        const afterApiPrefix = request.url.substring(apiPrefixIndex + API_PREFIX.length)
        // 移除开头的斜杠（如果有的话）
        url = afterApiPrefix.startsWith('/') ? afterApiPrefix.substring(1) : afterApiPrefix
      } else {
        // 如果没有找到API_PREFIX，使用原始URL（这种情况不应该发生）
        // API_PREFIX not found in request URL
        url = request.url
      }
      
      // Retrying request with new token
      
      return retryClient(url, newOptions)
    } catch (refreshError) {
      // 刷新失败，返回原始401响应
      Toast.notify({ type: 'error', message: i18n.t('operate.error.tokenRefreshFailed') })
      // 清除所有token并跳转到登录页
      tokenManager.clearTokens()
      window.location.href = '/signin'
      return Promise.reject(clonedResponse)
    }
  }

  // 处理其他HTTP错误
  if (!clonedResponse.ok) {
    try {
      const errorData = await clonedResponse.json() as ResponseError
      
      switch (clonedResponse.status) {
        case 403:
          // 403 Forbidden
          if (errorData.code === 'already_setup') {
            // Redirecting to signin due to already_setup error
            window.location.href = '/signin'
          }
          break
        case 500:
          // 500 Server Error
          break
        default:
          // HTTP Error
      }
      
      return Promise.reject(clonedResponse)
    } catch (parseError) {
      // JSON解析失败，返回原始响应
      return Promise.reject(clonedResponse)
    }
  }
  return response
}

// 错误拦截器
const beforeErrorHandler: BeforeErrorHook = (error) => {
  // Request failed
  // 网络错误处理
  if (error.message.includes('Failed to fetch')) {
    // Network error
  }
  
  return error
}

// 基础hooks配置
const baseHooks: Hooks = {
  beforeRequest: [beforeRequestAuth],
  afterResponse: [afterResponse204, afterResponseTokenHandler, afterResponseErrorHandler],
  beforeError: [beforeErrorHandler],
}

// 创建基础客户端实例
const baseClient = ky.create({
  prefixUrl: API_PREFIX,
  timeout: TIME_OUT,
  hooks: baseHooks,
  headers: {
    'Content-Type': ContentType.json,
  },
  credentials: 'include', // 恢复credentials配置，现在通过代理不会有CORS问题
  retry: {
    limit: 2,
    methods: ['get'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
})

// 创建重试客户端（不包含401处理拦截器，避免循环调用）
retryClient = ky.create({
  prefixUrl: API_PREFIX,
  timeout: TIME_OUT,
  headers: {
    'Content-Type': ContentType.json,
  },
  credentials: 'include',
  hooks: {
    beforeRequest: [beforeRequestAuth], // 包含认证头
    afterResponse: [afterResponse204, afterResponseTokenHandler], // 不包含401错误处理
    beforeError: [beforeErrorHandler],
  },
  retry: {
    limit: 1,
    methods: ['get'],
  },
})

// 创建不需要认证的客户端实例（用于登录、注册等）
const publicClient = ky.create({
  prefixUrl: API_PREFIX,
  timeout: TIME_OUT,
  headers: {
    'Content-Type': ContentType.json,
  },
  credentials: 'include', // 恢复credentials配置，现在通过代理不会有CORS问题
  hooks: {
    beforeRequest: [],
    afterResponse: [afterResponse204, afterResponseTokenHandler], // 添加token处理拦截器
    beforeError: [beforeErrorHandler],
  },
  retry: {
    limit: 1,
    methods: ['get'],
  },
})

export { baseClient, publicClient, tokenManager }