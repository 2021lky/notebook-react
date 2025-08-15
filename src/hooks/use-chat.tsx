import { useCallback } from 'react';
import { FileEntity, FileUploadOptions } from '@/components/base/chat-textarea/types';
import { useChatStore } from '@/stores/use-chat-store';
import { fetchFileUpload } from '@/service/llm';
import { useToastContext } from '@/components/base/toast';
import { useTranslation } from 'react-i18next';
/**
 * 聊天功能Hook
 * 提供聊天相关的操作方法，集成聊天上下文
 */
export const useChat = () => {
  const { notify } = useToastContext();
  const { t } = useTranslation();
  const {
    messages,
    isLoading,
    isStreaming,
    currentStreamContent,
    error,
    files,
    sendMessage,
    addFiles,
    removeFile,
    clearFiles,
    clearMessages,
    stopStreaming,
    requestId
  } = useChatStore();

  // 处理发送消息
  const handleSend = useCallback(async (content: string, files?: FileEntity[]) => {
    if (!content.trim()) return;

    try {
      // 如果有文件，先添加到上下文中
      if (files && files.length > 0) {
        addFiles(files);
      }

      // 发送消息
      await sendMessage(content);
      
      // 消息发送成功
    } catch (error) {
      notify({ type: 'error', message: t('operate.error.sendMessageFailed') });
      throw error;
    }
  }, [sendMessage, addFiles]);

  // 处理文件上传
  const handleFileUpload = useCallback(async (options: FileUploadOptions) => {
    try {
      const res = await fetchFileUpload(options.file, {
        onProgress: options.onProgressCallback,
        onSuccess: options.onSuccessCallback,
        onError: options.onErrorCallback
      });

      return res
    } catch (error) {
      notify({ type: 'error', message: t('operate.error.fileUploadFailed') });
      
      // 调用错误回调
      options.onErrorCallback?.();
      
      throw error;
    }
  }, []);


  return {
    // 聊天状态
    messages,
    isLoading,
    isStreaming,
    currentStreamContent,
    error,
    files,
    
    // 聊天操作
    handleSend,
    handleFileUpload,
    
    // 上下文操作
    addFiles,
    removeFile,
    clearFiles,
    clearMessages,
    stopStreaming,
    requestId
  };
};

export default useChat;
