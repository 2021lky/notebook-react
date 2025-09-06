import Toast from "@/components/base/Toast";
import type { KyResponse } from 'ky';
import { get, post } from "./base"
import { ChatSendOptions, FileUploadOptions } from '@/components/base/ChatTextArea/types';
import { verifyLogin } from '@/service/login';

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

export const fetchStreamedChat = async (options: ChatSendOptions) => {
  try {
    const response = await post<KyResponse>("/llm/chat", 
      { 
        headers: {
          Accept: 'text/event-stream',
          'Content-Type': 'application/json',
        },
        body: { messages: [{ role: "user", content: options.query }]}
      }, 
      { responseJson: false, getAbortController: options.getAbortController }
    );
    if (!response.ok) {
      options.onErrorCallback?.(new Error(`HTTP错误：${response.status}`));
      return;
    }

    // 1. 获取流读取器和解码器
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullAnswer = "";
    if (!reader) {
      options.onErrorCallback?.(new Error('无法获取响应流'));
      return;
    }
    // 2. 循环读取分块
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        options.onSuccessCallback?.();
        console.log('chat done');
        break;
      }

      // 3. 解析分块数据
      const chunkStr = decoder.decode(value, { stream: true }); // stream: true 保留未完成的UTF-8序列
      const chunks = chunkStr.split("\n\n").filter(Boolean); // 按换行分割（后端每块结尾加\n）

      for (const chunk of chunks) {
        if (chunk.startsWith('data: ')) {
          const line = chunk.slice(6).trim();
          if (line === '[DONE]') {
            break;
          }
          const data = JSON.parse(line);
          // 判断是否开始阶段
          if (data.requestId && data.type && data.type === 'start') {
            console.log("开始", data.requestId)
            options.onStartCallback?.(data.requestId)
            continue;
          }
          if (data.choices?.[0]?.delta?.content) {
            fullAnswer += data.choices?.[0]?.delta?.content;
            options.onChunkCallback?.(fullAnswer)
          }
        }
      }
    }
  } catch (err) {
    console.log(err)
    console.error("流式请求失败：", err);
    Toast.notify({ type: "error", message: ""})
  }
}

// 文件上传
export const fileUploadRequest = (url: string, options: FileUploadOptions) => {
  const data = options.file;
  const xhr = new XMLHttpRequest()
  // 添加请求头信息
  const token = localStorage.getItem('access_token')

  const formData = new FormData()
  formData.append('file', data.originalFile!)

  // 将取消函数注册回去，FileItem 的 onRemove 即可调用
  options.onStopCallback?.(() => xhr.abort())

  xhr.open('POST', url)
  // xhr.setRequestHeader('Content-Type', 'multipart/form-data')
  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {  // 指示当前上传的总大小是否可计算
      const progress = Math.round((event.loaded / event.total) * 100)
      options.onProgressCallback?.(progress)
    }
  })
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const response = JSON.parse(xhr.response)
        options.onSuccessCallback?.(response)
      } catch (error) {
        options.onErrorCallback?.(new Error('响应解析失败'))
      }
    } else if(xhr.status === 401) {
      verifyLogin().then(() => {
        fileUploadRequest(url, options)
      })
    }
    else {
      options.onErrorCallback?.(new Error(`HTTP错误: ${xhr.status}`))
    }
  })
  xhr.addEventListener('error', () => {
    options.onErrorCallback?.(new Error('请求失败'))
  })
  xhr.addEventListener('timeout', () => {
    options.onErrorCallback?.(new Error('请求超时'))
  })
  xhr.setRequestHeader("Authorization", `Bearer ${token}`)
  xhr.send(formData)
}

export const stopChat = async (params: {
  requestId?: string,
  stopAll?: boolean
}) => {
  return await post('llm/stop', { body: { ...params} })
}