import type { AfterResponseHook, BeforeRequestHook } from 'ky'
import ky from 'ky'
import { API_PREFIX, TIME_OUT } from '@/constant'
import Toast from '@/components/base/Toast'
import i18n from '@/i18n/i18next-config'
import { IOtherOptions } from "./base"

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
  async refreshAccessToken() {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }
    // 如果不存在刷新token，则直接跳转到登录页面
    if (!this.refreshToken) {
      this.clearTokens()
      window.location.href = '/signin'
      throw new Error('No refresh token available')
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh()

    try {
      await this.refreshPromise  // 发送refresh请求，获取新的access token
    } catch (error) {
      this.clearTokens()
      window.location.href = '/signin'
      throw error
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
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
        throw new Error('Network Error：token refresh failed')
      }
      const data = await response.json()
      // Token refresh completed
      if (data.status === "success" && data.data) {
        const { accessToken, refreshToken } = data.data
        this.setTokens(accessToken, refreshToken || this.refreshToken!)
        return accessToken
      } else {
        this.clearTokens()
        window.location.href = '/signin'
        throw new Error(data.message || 'Token refresh failed')
      }
    } catch (error) {
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
    return Response.json({ message: 'success' })
  }
}

// 响应拦截器 - 自动处理token存储（登录成功后）
const afterResponseSuccess: AfterResponseHook = async (request, _options, response) => {
  // 1) 对于流式响应或特定流式接口，直接跳过（防止阻塞）
  const url = request instanceof Request ? request.url : String(request)
  const contentType = response.headers.get('content-type') || ''
  if (
    contentType.includes('text/event-stream') || // 正确的 SSE 响应头
    url.includes('/llm/chat')                    // 防御：即便被错误地标成 application/json 也跳过
  ) {
    return response
  }

  // 2) 非流式的 JSON 响应，才尝试自动提取 token
  if (response.ok) {
    const ct = contentType
    if (ct && ct.includes('application/json')) {
      try {
        const clonedResponse = response.clone()
        const data = await clonedResponse.json()

        if (data && data.data && data.data.accessToken && data.data.refreshToken) {
          // 自动存储token到localStorage
          tokenManager.setTokens(data.data.accessToken, data.data.refreshToken)
        }
      } catch (error) {
        // JSON解析失败，忽略错误继续处理
      }
    }
  }
}

// 响应拦截器 - 处理token过期和错误
const afterResponse401: AfterResponseHook = async (request, options, response) => {
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
      // 重新发送
      console.log("refresh 之后 发送的url", request.url)
      return base(request.url, newOptions)
    } catch (refreshError) {
      // 刷新失败，返回原始401响应
      Toast.notify({ type: 'error', message: i18n.t('operate.error.tokenRefreshFailed') })
      tokenManager.clearTokens()
      window.location.href = '/signin'
      return Promise.reject(clonedResponse)
    }
  } else if (clonedResponse.status === 403) {
    tokenManager.clearTokens()
    window.location.href = '/signin'
    return Promise.reject(clonedResponse)
  }
}

// 5. 创建客户端
const baseClient = ky.create({
  
  timeout: TIME_OUT,
  hooks: {
    beforeRequest: [beforeRequestAuth],
    afterResponse: [afterResponse204, afterResponseSuccess, afterResponse401],
  },
  headers: {
    'Content-Type': ContentType.json,
  },
  credentials: 'include', // 恢复credentials配置，现在通过代理不会有CORS问题
  retry: {
    limit: 3,
    methods: ['get'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
})

export const baseOptions: RequestInit = {
  method: 'GET',
  mode: 'cors',
  headers: new Headers({
    'Content-Type': ContentType.json,
  }),
  redirect: 'follow',
}

async function base<T>(url: string, options: FetchOptionType = {}, otherOptions: IOtherOptions = {}): Promise<T> {
  const { params, body, headers, ...init } = Object.assign({}, baseOptions, options)
  const {
    getAbortController,
    bodyStringify = true,
    responseJson = true,
  } = otherOptions

  let base: string = API_PREFIX

  // 创建中止控制器，并在请求添加中止信号
  if (getAbortController) {
    const abortController = new AbortController()
    getAbortController(abortController)
    options.signal = abortController.signal
  }
  // 请求拼接（新增绝对地址判断）
  const isAbsolute = /^https?:\/\//i.test(url)
  const fetchPathname = isAbsolute
    ? url
    : base + (url.startsWith('/') ? url : `/${url}`)

  // 发送请求
  const res = await baseClient(fetchPathname, {
    ...init,
    headers,
    credentials: (options.credentials || 'include'),
    retry: {
      methods: [],
    },
    ...(bodyStringify ? { json: body } : { body: body as BodyInit }),  // json 会自动序列化，并添加content-type: application/json
    searchParams: params,
    fetch(resource: RequestInfo | URL, options?: RequestInit) {
      if (resource instanceof Request && options) {
        const mergedHeaders = new Headers(options.headers || {})
        resource.headers.forEach((value, key) => {
          mergedHeaders.append(key, value)
        })
        options.headers = mergedHeaders
      }
      return globalThis.fetch(resource, options)
    },
  })
  
  // 自动解析响应内容，根据响应头判断返回类型
  if (responseJson) {
    const contentType = res.headers.get('content-type')
    if (
      contentType
      && [ContentType.download, ContentType.audio, ContentType.downloadZip].includes(contentType)
    )
      return await res.blob() as T

    return await res.json() as T
  }else{
    return res as T;
  }
}

export { base, tokenManager }