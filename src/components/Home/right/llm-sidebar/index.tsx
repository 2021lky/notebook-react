import React, { useEffect, useRef, useCallback } from 'react';
import { RiCloseCircleLine } from '@remixicon/react';
import ChatTextArea from '@/components/base/chat-textarea';
import MarkdownRenderer from '@/components/base/markdown-renderer';
import useChat from '@/hooks/use-chat';
import { useTranslation } from 'react-i18next';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    initialText?: string;
}

const LLMSidebar: React.FC<Props> = ({ isOpen, onClose, initialText }) => {
    const { t } = useTranslation();
    const {
        messages,
        isStreaming,
        currentStreamContent,
        error,
        handleSend,
        handleFileUpload,
        clearMessages,
        stopStreaming
    } = useChat();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // 自动滚动到底部
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    // 当消息更新时自动滚动到底部
    useEffect(() => {
        scrollToBottom();
    }, [messages, currentStreamContent]);

    const handleStop = useCallback(() => {
        stopStreaming()
    }, [stopStreaming])

    if (!isOpen) return null;

    return (
        <div 
            className="absolute top-0 right-0 w-80 flex flex-col rounded-lg z-50"
            style={{
                height: 'calc(100% - 48px)',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff'
            }}
        >
            {/* Header */}
            <div 
                className="flex items-center h-12 justify-between p-2 flex-shrink-0"
                style={{
                    borderBottom: '1px solid #e5e7eb'
                }}
            >
                <h3 className="text-lg font-semibold text-gray-800">{t('common.llm.aiAssistant')}</h3>
                <RiCloseCircleLine onClick={onClose} className='cursor-pointer w-4 h-4'/>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 w-full" style={{ minHeight: 0 }}>
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p>{t('common.llm.startConversation')}</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`w-full flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`w-full lg:max-w-md px-4 py-2 rounded-lg mb-2 ${
                                        message.role === 'user'
                                            ? 'text-primary'
                                            : 'bg-tertiary text-primary'
                                    }`}
                                >
                                    {message.role === 'user' ? (
                                        <div className="w-full flex justify-end">
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    ) : (
                                        <MarkdownRenderer 
                                            content={message.content} 
                                            className="text-sm max-w-full"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {/* 流式输出内容 - 在消息列表中显示 */}
                        {currentStreamContent && (
                            <div className="w-full flex justify-start">
                                <div className="w-full lg:max-w-md bg-tertiary text-primary px-4 py-2 rounded-lg mb-2 overflow-hidden">
                                    <MarkdownRenderer 
                                        content={currentStreamContent} 
                                        className="text-sm max-w-full break-words whitespace-pre-wrap"
                                    />
                                    {isStreaming && (
                                        <span className="inline-block w-2 h-4 bg-tertiary animate-pulse ml-1 align-middle"></span>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* 错误信息 */}
                        {error && (
                            <div className="flex justify-center">
                                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            </div>
                        )}
                        
                        {/* 清空按钮 */}
                        { !isStreaming && <div className="flex justify-center">
                            <button 
                                onClick={clearMessages}
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
                    value={initialText}
                    onSend={handleSend}
                    enableVoiceInput={false}
                    enableFileUpload={true}
                    onFileUpload={handleFileUpload}
                    maxLength={1000}
                    isStreaming={isStreaming}
                    onStop={handleStop}
                />
            
            </div>
        </div>
    );
};

export default LLMSidebar;