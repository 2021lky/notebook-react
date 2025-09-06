import { base } from "./fetch"

export async function asyncRunSafe<T = any>(fn: Promise<T>): Promise<[Error] | [null, T]> {
  try {
    return [null, await fn]
  }
  catch (e: any) {
    return [e || new Error('unknown error')]
  }
}

// 配置额外的请求参数类型，包含回调函数类型
export type IOtherOptions = {
    bodyStringify?: boolean
    responseJson?: boolean
    getAbortController?: (abortController: AbortController) => void  // 获取当前请求的AbortController实例的回调
    onChunkCallback?: (content: string) => void
    onErrorCallback?: (error: Error) => void
    onStartCallback?: () => void
    onProgressCallback?: (progress: number) => void // 文件上传进度回调
    onSuccessCallback?: (res?: { id: string; url: string }) => void // 文件上传成功回调
    onStopCallback?: (cancel: () => void) => void // 中断上传，接收一个中断函数
}

export const get = <T>(url: string, options = {}, otherOptions?: IOtherOptions) => {
    return base<T>(url, Object.assign({}, options, { method: 'GET' }), otherOptions)
}

export const post = <T>(url: string, options = {}, otherOptions?: IOtherOptions) => {
    return base<T>(url, Object.assign({}, options, { method: 'POST' }), otherOptions)
}

export const put = <T>(url: string, options = {}, otherOptions?: IOtherOptions) => {
    return base<T>(url, Object.assign({}, options, { method: 'PUT' }), otherOptions)
}


export const del = <T>(url: string, options = {}, otherOptions?: IOtherOptions) => {
    return base<T>(url, Object.assign({}, options, { method: 'DELETE' }), otherOptions)
}

export const patch = <T>(url: string, options = {}, otherOptions?: IOtherOptions) => {
    return base<T>(url, Object.assign({}, options, { method: 'PATCH' }), otherOptions)
}
