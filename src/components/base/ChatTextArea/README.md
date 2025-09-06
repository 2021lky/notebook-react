# 多功能文本库组件
### 功能
- 文本框自适应高度
  - 通过设置参数
    - `adjustHeight?: boolean;`  // 是否支持自动调整高度
    - `maxHeight?: number;`  // 最大高度
    - `minHeight?: number;`  // 最小高度
- 支持携带文件（目前只支持文档和图片）的消息发送
  - 开启 `enableFileUpload?: boolean;` 开关
  - 配置 `const defaultFileConfig: FileConfig = {`
    - `allowed_file_types: ["image", "document"],`  // 支持文件类型，目前只支持这两种
    - `allowed_file_extensions: ["jpg", "jpeg", "png", "gif", "doc", "docx", "pdf", "xls", "xlsx"],` // 允许上传的文件扩展名
    - `fileUploadConfig: {`
      - `image_file_size_limit: 5,` // 图片文件大小限制, 单位MB
      - `audio_file_size_limit: 10,` // 音频文件大小限制, 单位MB
      - `video_file_size_limit: 100,` // 视频文件大小限制, 单位MB
      - `document_file_size_limit: 100,` // 文档文件大小限制, 单位MB
      - `file_count_limit: 3,` // 文件数量限制
    - `}`
  - `}`
- 显示文件上传进度，支持文件中断上传
  - 在发送请求函数 `onFileUpload` 有对应不同生命周期的钩子，只需在请求过程中触发钩子即可：
    - `onProgressCallback?: (progress: number) => void` // 文件上传进度回调
    - `onSuccessCallback?: (res: { id: string; url: string }) => void` // 文件上传成功回调
    - `onErrorCallback?: (error: Error) => void` // 文件上传失败回调
    - `onStopCallback?: (cancel: () => void) => void` // 中断上传，接收一个中断函数
- 支持流式输出和中断响应
  - 同上，在发送消息 `onSend` 中有对应不同生命周期的钩子：
    - `onChunkCallback?: (content: string) => void`
    - `onSuccessCallback?: () => void`
    - `onErrorCallback?: (error: Error) => void`
    - `onStartCallback?: () => void`
  - 中断响应需要额外实现函数 `onStop`
- 支持文件的拖拽上传以及粘贴上传

### 前端使用示例
```
import { useState, useRef } from 'react';
import { FileUploadOptions, FileEntity, ChatSendOptions } from '@/components/Chat/ChatTextArea/types';
import ChatTextArea from '@/components/Chat/ChatTextArea';

const App = () => {
  const [value, setValue] = useState('');
  const chatContentRef = useRef<HTMLDivElement>(null);
  const [requestId, setRequestId] = useState<string>("")
  const fileUploadRequest = (url: string, data: FileEntity, options: FileUploadOptions) => {
    const xhr = new XMLHttpRequest()
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
      } else {
        options.onErrorCallback?.(new Error(`HTTP错误: ${xhr.status}`))
      }
    })
    xhr.addEventListener('error', () => {
      options.onErrorCallback?.(new Error('请求失败'))
    })
    xhr.addEventListener('timeout', () => {
      options.onErrorCallback?.(new Error('请求超时'))
    })

    xhr.send(formData)
  }

  // 前端：Fetch 流式获取数据
  async function fetchStreamedChat(options: ChatSendOptions) {

    try {
      const response = await fetch("http://localhost:3000/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: options.query }),
      });

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
          console.log('done')
          break;
        }

        // 3. 解析分块数据
        const chunkStr = decoder.decode(value, { stream: true }); // stream: true 保留未完成的UTF-8序列
        const chunks = chunkStr.split("\n\n").filter(Boolean); // 按换行分割（后端每块结尾加\n）

        for (const chunk of chunks) {
          if (chunk.startsWith('data: ')) {
            const line = chunk.slice(6).trim();
            if (line === '[DONE]') {
              console.log('done')
              break;
            }
            const data = JSON.parse(line);
            // 判断是否开始阶段
            if (data.requestId && data.type && data.type === 'start') {
              setRequestId(data.requestId)
              options.onStartCallback?.()
              continue;
            }
            if (data.choices?.[0]?.delta?.content) {
              fullAnswer += data.choices?.[0]?.delta?.content;
              options.onChunkCallback?.(fullAnswer)
              // 渲染到页面（如更新DOM）
              if (chatContentRef.current) {
                chatContentRef.current.textContent = fullAnswer;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("流式请求失败：", err);
      if (chatContentRef.current) {
        chatContentRef.current.textContent = "error";
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ChatTextArea
        value={value}
        onSend={(params: ChatSendOptions) => {
          fetchStreamedChat(params)
        }}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onFileUpload={(options: FileUploadOptions) => {
          fileUploadRequest('http://localhost:3000/chat/file', options.file, options)
        }}
        maxLength={5000}
        wrapperClassName='!w-64'
        onStop={() => {
          fetch('http://localhost:3000/chat/stop', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ requestId }),
          }).catch((error) => {
            console.log(error)
          })
        }}
      />
      <div ref={chatContentRef}>

      </div>
    </div>
  );
};

export default App;
```

### 后端代码实现（nodejs）
#### app.js
```
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3000;

// 1. 创建 Express 实例
const app = express();

// 2. 配置中间件
// 应用cors中间件（允许所有跨域请求）
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// 中间件：解析 JSON 格式的请求体（必备，否则无法获取 req.body）
app.use(express.json());

// 3. 引入路由
const chatRouter = require('./route/chat')
app.use('/chat', chatRouter);

```

#### route/chat.js 
```
const express = require('express');
const router = express.Router();
const multer = require('multer');

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const LLM_API_KEY = "sk-iozozzqdndfgrxepjgcoogietagvkajycqzwewnxsxntbabm"
const LLM_BASE_URL = "https://api.siliconflow.cn/v1/chat/completions"

// 1. 配置 multer 存储路径和文件名
const storage = multer.diskStorage({
  // 保存路径（需确保目录存在，否则会报错）
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", 'uploads'); // 保存到项目根目录的 uploads 文件夹
    // 检查目录是否存在，不存在则创建
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // recursive: true 支持创建多级目录
    }
    cb(null, uploadDir); // 传递保存目录给回调
  },
  // 文件名（避免重复，可自定义规则）
  filename: (req, file, cb) => {
    // 示例：原文件名 + 时间戳 + 扩展名（如 "avatar-1620000000000.jpg"）
    const ext = path.extname(file.originalname); // 获取扩展名（如 .jpg）
    const baseName = path.basename(file.originalname, ext); // 获取不含扩展名的文件名
    const fileName = `${baseName}-${Date.now()}${ext}`;
    cb(null, fileName);
  }
});

// 2. 创建 multer 实例（可添加文件过滤规则）
const upload = multer({
  storage: storage,
});

// 3. 处理文件上传的路由
router.post('/file', upload.single('file'), (req, res) => {
  try {
    // 文件信息在 req.file 中
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: '未上传文件' });
    }

    const fileInfo = {
        id: uuidv4(),
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadTime: new Date().toISOString(),
    };

    res.status(200).json({
      message: '文件上传成功',
      fileInfo
    });
  } catch (err) {
    res.status(500).json({
      message: '文件上传失败',
      error: err.message
    });
  }
});

// 简化的活动请求管理
const activeRequests = new Map();

// 简化的消息接口
router.post('/message', async (req, res) => {
  try {
    const { messages, model = 'Qwen/Qwen2.5-7B-Instruct' } = req.body;
    console.log(messages)
    const requestId = uuidv4();
    const abortController = new AbortController();
    activeRequests.set(requestId, abortController);

    // 设置流式响应头
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 客户端断开时清理
    res.on('close', () => {
      activeRequests.delete(requestId);
    });
    
    // 发送请求ID
    res.write(`data: ${JSON.stringify({ type: 'start', requestId })}\n\n`);

    // 导入 fetch
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(LLM_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages:[{
          role: 'user',
          content: messages
        }],
        stream: true
      }),
      signal: abortController.signal
    });
    
    if (!response.ok) {
      res.write(`data: ${JSON.stringify({ error: 'API调用失败' })}\n\n`);
      res.end();
      activeRequests.delete(requestId);
      return;
    }
    
    // 处理流式数据
    response.body.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data.trim() === '[DONE]') {
            res.write('data: [DONE]\n\n');
            res.end();
            activeRequests.delete(requestId);
            return;
          }
          res.write(`${line}\n\n`);
        }else if(line.startsWith('error: ')){
          res.write(`${line}\n\n`);
        }
      }
    });
    
    response.body.on('end', () => {
      res.end();
      activeRequests.delete(requestId);
    });
    
    response.body.on('error', (error) => {
      res.write(`error: ${JSON.stringify({ error: '流处理错误', details: error.message })}\n\n`);
      res.end();
      activeRequests.delete(requestId);
    });
    
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: '请求失败', details: error.message })}\n\n`);
    res.end();
    activeRequests.delete(requestId);
  }
});

// 简化的停止接口
router.post('/stop', (req, res) => {
  const { requestId } = req.body;
  
  if (!requestId) {
    return res.status(400).json({ error: '缺少requestId' });
  }
  
  const abortController = activeRequests.get(requestId);
  if (!abortController) {
    return res.status(404).json({ error: '请求不存在' });
  }
  
  abortController.abort();
  activeRequests.delete(requestId);
  
  res.json({ success: true, message: '已停止回答' });
});

module.exports = router;
```