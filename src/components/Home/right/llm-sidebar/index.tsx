import React, { useEffect, useRef, useState } from 'react';
import { RiCloseCircleLine } from '@remixicon/react';
import ChatTextArea from '@/components/base/ChatTextArea';
import MarkdownRenderer from '@/components/base/markdown-renderer';
import useChat from '@/hooks/use-chat';
import { useTranslation } from 'react-i18next';
import { uuid4 } from "@/utils/uuid"
import { ChatMessage } from '@/hooks/use-chat'
import { stopChat } from '@/service/llm';
import Toast from '@/components/base/Toast'

type Props = {
    isOpen: boolean;
    onClose: () => void;
    initialText?: string;
}

const LLMSidebar: React.FC<Props> = ({ isOpen, onClose, initialText }) => {
    const { t } = useTranslation();
    const [value, setValue] = useState(initialText || '');
     const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const [currentStreamContent, setCurrentStreamContent] = useState<string>("")
    const streamContentRef = useRef<string>("")
    const [requestId, setRequestId] = useState<string>("")
    const [isStreaming, setIsStreaming] = useState<boolean>(false);

    const {
        messages,
        setMessages,
        handleSend,
        handleFileUpload,
    } = useChat();
    // 自动滚动到底部
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    const onChunkCallback = (content: string) => {
        setCurrentStreamContent(content)
        streamContentRef.current = content
    }

    const onSuccessCallback = () => {
        // 由于这里是闭包，currentStreamContent不是最新的
        const m: ChatMessage = {
            id: requestId || uuid4(),
            role: 'assistant',
            content: streamContentRef.current,
        }
        setMessages((prev) => [...prev, m])
        setIsStreaming(false)
        setCurrentStreamContent("")   // 成功后清空，避免多出一个“遗留的流式气泡”
        streamContentRef.current = "" // 清空当前流式内容
        setRequestId("")              // 可选：一并清空请求ID
    }

    const onStartCallback = (requestId: string) => {
        setIsStreaming(true)
        setRequestId(requestId)
        setCurrentStreamContent("")   // 开始时清空，确保重新累计本次流式内容
        streamContentRef.current = "" // 清空当前流式内容
    }

    const onStopCallback = () => {
        // 优先通知后端停止指定请求（如果拿到了requestId）
        if (requestId) {
            stopChat({ requestId }).catch(() => { Toast.notify({ type: 'error', message: "停止失败" }) });
        }
    }

    // 当消息更新时自动滚动到底部
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 新增：流式内容变化时也滚动
    useEffect(() => {
        if (currentStreamContent) {
            scrollToBottom();
        }
    }, [currentStreamContent]);

    if (!isOpen) return null;

    return (
        <div
            className="absolute top-0 right-0 w-80 flex flex-col rounded-md z-50 h-full bg-transparent border border-border-dark p-1 shadow-lg"
        >
            {/* Header */}
            <div
                className="flex items-center h-12 justify-between p-2 flex-shrink-0 border-b border-border-dark"
            >
                <h3 className="text-lg font-semibold text-text-primary">{t('common.llm.aiAssistant')}</h3>
                <RiCloseCircleLine onClick={onClose} className='cursor-pointer text-text-primary w-4 h-4' />
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 w-full" style={{ minHeight: 0 }}>
                {messages.length === 0 ? (
                    <div className="text-center text-text-primary mt-8">
                        <p>{t('common.llm.startConversation')}</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <div
                                key={message.id ?? index}   // 使用更稳定的 key，避免潜在的复用问题
                                className={`w-full flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`w-full lg:max-w-md px-4 py-2 rounded-lg mb-2 ${message.role === 'user'
                                        ? 'text-text-primary'
                                        : 'bg-primary-200 text-text-primary'
                                        }`}
                                >
                                    {message.role === 'user' ? (
                                        <div className="w-full flex justify-end">
                                            <p className="text-sm text-text-primary whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    ) : (
                                        <MarkdownRenderer
                                            content={message.content}
                                            className="text-sm max-w-full text-text-primary"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* 流式输出内容 - 在消息列表中显示，只在流式中显示 */}
                        {isStreaming && currentStreamContent && (
                            <div className="w-full flex justify-start">
                                <div className="w-full lg:max-w-md bg-primary-200 text-text-primary px-4 py-2 rounded-lg mb-2 overflow-hidden">
                                    <MarkdownRenderer
                                        content={currentStreamContent}
                                        className="text-sm max-w-full break-words whitespace-pre-wrap text-text-primary"
                                    />
                                    <span className="inline-block w-2 h-4 bg-tertiary animate-pulse ml-1 align-middle"></span>
                                </div>
                            </div>
                        )}

                        {/* 清空按钮 */}
                        {!isStreaming && <div className="flex justify-center">
                            <button
                                onClick={() => setMessages([])}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                {t('common.llm.clearConversation')}
                            </button>
                        </div>}

                        {/* 滚动锚点 */}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div
                className="p-2 flex-shrink-0"
                style={{
                    borderTop: '1px solid #e5e7eb'
                }}
            >
                <ChatTextArea
                    placeholder={t('common.llm.inputPlaceholder')}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                    maxLength={5000}
                    wrapperClassName='!w-full !bg-transparent'
                    className="!bg-transparent"
                    adjustHeight
                    onSend={handleSend}
                    onFileUpload={handleFileUpload}
                    customChatSendCallback={{
                        onChunkCallback,
                        onSuccessCallback,
                        onStartCallback,
                        onStopCallback
                    }}
                />

            </div>
        </div>
    );
};

export default LLMSidebar;