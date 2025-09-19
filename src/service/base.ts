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


interface QueueItem<T, R> {
  params: T;
  resolve: (r: R) => void;
  reject: (reason: unknown) => void;
}

/**
 * 创建一个自动合并请求的函数
 * 在一定窗口期内的所有请求都会被合并提交合并发送
 * 支持可选的 keySelector/resultKeySelector，用于将后端返回的结果按 id 分发给各个请求
 * - 若未提供 keySelector，将退化为按索引一一对应（与旧实现兼容）
 */
export function createAutoMergedRequest<T, R>(
  fn: (mergedParams: T[]) => Promise<R[]>,
  windowMs = 200,
  options?: {
    keySelector?: (item: T) => string | number
    resultKeySelector?: (item: R) => string | number
  }
): (params: T) => Promise<R> {
  let queue: QueueItem<T, R>[] = [];
  let timer: number | null = null;

  async function submitQueue() {
    timer = null; // 清空计时器以接受后续请求
    const _queue = [...queue];
    queue = []; // 清空队列

    try {
      const mergedParams = _queue.map((q) => q.params)
      const list = await fn(mergedParams);

      const keySel = options?.keySelector
      const resKeySel = options?.resultKeySelector

      if (keySel && resKeySel) {
        // 使用 key 做映射，处理后端去重/顺序变化的场景
        const resMap = new Map<string | number, R>()
        list.forEach((r) => {
          const k = resKeySel(r)
          resMap.set(k, r)
        })
        _queue.forEach((q1) => {
          const k = keySel(q1.params)
          if (resMap.has(k)) {
            q1.resolve(resMap.get(k) as R)
          } else {
            // 找不到对应项时，降级策略：返回第一个结果，避免整体 reject
            q1.resolve(list[0] as R)
          }
        })
      } else {
        // 向后兼容：按索引对应
        _queue.forEach((q1, i) => {
          q1.resolve(list[i]);
        });
      }
    } catch (err) {
      _queue.forEach((q2) => {
        q2.reject(err);
      });
    }
  }

  return (params: T): Promise<R> => {
    if (!timer) {
      // 如果没有开始窗口期，则创建
      timer = window.setTimeout(() => {
        submitQueue();
      }, windowMs);
    }

    return new Promise<R>((resolve, reject) => {
      queue.push({
        params,
        resolve,
        reject,
      });
    });
  };
}
