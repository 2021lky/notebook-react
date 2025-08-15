import { create } from 'zustand';
import { ChatMessage, chatStream, ChatRequest, stopChat } from '@/service/llm';
import { FileEntity } from '@/components/base/chat-textarea/types';
import Toast from '@/components/base/toast'
import i18n from '@/i18n/i18next-config';

// 聊天状态类型
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  currentStreamContent: string;
  error: string | null;
  files: FileEntity[];
  abortController: AbortController | null;
  requestId: string | null;
}

// 聊天Store接口
export interface ChatStore extends ChatState {
  // Actions
  sendMessage: (content: string, options?: { model?: string; temperature?: number; maxTokens?: number }) => Promise<void>;
  addFiles: (files: FileEntity[]) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  clearMessages: () => void;
  stopStreaming: () => void;
  // Internal actions
  addMessage: (message: ChatMessage) => void;
  updateStreamContent: (content: string) => void;
  appendStreamContent: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;
}

// 创建Zustand Store
export const useChatStore = create<ChatStore>((set, get) => ({
  // 初始状态
  messages: [],
  isLoading: false,
  isStreaming: false,
  currentStreamContent: '',
  error: null,
  files: [],
  abortController: null,
  requestId: null,

  // Actions
  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
      currentStreamContent: '',
      error: null
    }));
  },

  updateStreamContent: (content: string) => {
    set({ currentStreamContent: content });
  },

  appendStreamContent: (content: string) => {
    set((state) => ({
      currentStreamContent: state.currentStreamContent + content
    }));
  },

  setLoading: (loading: boolean) => {
    set((state) => ({
      isLoading: loading,
      error: loading ? null : state.error
    }));
  },

  setStreaming: (streaming: boolean) => {
    set({
      isStreaming: streaming,
      currentStreamContent: streaming ? get().currentStreamContent : ''
    });
  },

  setError: (error: string | null) => {
    set({
      error,
      isLoading: false,
      isStreaming: false,
      currentStreamContent: ''
    });
  },

  addFiles: (files: FileEntity[]) => {
    set((state) => ({
      files: [...state.files, ...files]
    }));
  },

  removeFile: (fileId: string) => {
    set((state) => ({
      files: state.files.filter(file => file.id !== fileId)
    }));
  },

  clearFiles: () => {
    set({ files: [] });
  },

  clearMessages: () => {
    set({
      messages: [],
      currentStreamContent: '',
      error: null,
      requestId: null
    });
  },

  stopStreaming: () => {
    const { abortController, requestId } = get();
    // 优先通知后端停止指定请求（如果拿到了requestId）
    if (requestId) {
      // fire-and-forget，不阻塞UI
      stopChat({ requestId }).catch(() => {console.error({ type: 'error', message: i18n.t('operate.error.llmStopFailed') }) });
    }
    // 本地中断读取
    if (abortController) {
      abortController.abort();
    }
    set({
      isStreaming: false,
      isLoading: false,
      currentStreamContent: '',
      abortController: null,
      requestId: null
    });
  },

  // 发送消息 - 只支持流式输出
  sendMessage: async (
    content: string,
    options: { model?: string; temperature?: number; maxTokens?: number } = {}
  ) => {
    if (!content.trim()) return;

    const {
      messages,
      addMessage,
      setLoading,
      setError,
      updateStreamContent,
      setStreaming,
      appendStreamContent,
      clearFiles
    } = get();

    try {
      // 添加用户消息
      const userMessage: ChatMessage = {
        role: 'user',
        content: content.trim()
      };
      addMessage(userMessage);

      // 设置加载状态
      setLoading(true);
      setError(null);
      updateStreamContent('');
      set({ requestId: null });

      // 创建中断控制器
      const abortController = new AbortController();
      set({ abortController });

      // 准备聊天请求 - 只支持流式输出
      const chatRequest: ChatRequest = {
        messages: [...messages, userMessage],
        model: options.model || 'Qwen/Qwen2.5-7B-Instruct',
        stream: true, // 固定为流式响应
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048
      };

      // 流式响应处理
      setStreaming(true);
      updateStreamContent('');
      
      await chatStream(
        chatRequest,
        // onChunk: 处理每个数据块
        (content: string) => {
          // 检查是否被中断
          if (get().abortController?.signal.aborted) {
            return;
          }
          appendStreamContent(content);
        },
        // onComplete: 流式响应完成
        (fullContent: string) => {
          // 检查是否被中断
          if (get().abortController?.signal.aborted) {
            return;
          }
          
          // 添加完整的助手消息
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: fullContent
          };
          addMessage(assistantMessage);
          setStreaming(false);
          // 清空流式内容，避免与消息列表中的内容重复显示
          updateStreamContent('');
          set({ requestId: null });
        },
        // onError: 处理错误
        (error: Error) => {
          if (!get().abortController?.signal.aborted) {
            setError(error.message);
          }
          setStreaming(false);
          updateStreamContent('');
          set({ requestId: null });
        },
        // onStart: 一旦拿到requestId就设置
        (requestId?: string) => {
          if (requestId) {
            set({ requestId });
          }
        }
      );

      // 清除文件（消息发送成功后）
      clearFiles();

    } catch (error) {
      // 检查是否是用户主动中断
      if (get().abortController?.signal.aborted) {
        setError('请求已中断');
        Toast.notify({ type: 'warning', message: i18n.t('operate.error.requestAborted') });
      } else {
        const errorMessage = error instanceof Error ? error.message : '发送消息失败，请重试';
        Toast.notify({ type: 'error', message: errorMessage });
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      set({ abortController: null });
    }
  }
}));

export default useChatStore;