import { useState } from 'react';
import { ChatSendOptions, FileUploadOptions } from '@/components/base/ChatTextArea/types';
import { fileUploadRequest, fetchStreamedChat } from '@/service/llm';
import { uuid4 } from "@/utils/uuid"
import { API_PREFIX } from '@/constant';

export type ChatMessage = {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const useChat = () => {
  // 存储聊天记录
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 处理发送消息
  const handleSend = async (options: ChatSendOptions) => {
    const m: ChatMessage = {
      id: uuid4(),
      role: 'user',
      content: options.query,
    }
    setMessages(prev => {
      return [...prev, m];
    })
    fetchStreamedChat(options)
  }

  // 处理文件上传
  const handleFileUpload = (options: FileUploadOptions) => {
      fileUploadRequest(`${API_PREFIX}/upload/file`, options)
  };

  return {
    messages,
    setMessages,
    handleSend,
    handleFileUpload,
  };
};

export default useChat;
