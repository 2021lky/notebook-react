import React, { FC, useState, useRef, useCallback, useEffect, useMemo, KeyboardEvent, ClipboardEvent } from "react";
import { useFile } from './hooks/use-file';
import { FileList } from './FileList';
import { ChatTextAreaProps } from './types';
import { RiSendPlaneFill, RiAttachmentLine, RiStopCircleLine } from "@remixicon/react"
import { useTranslation } from 'react-i18next'
import { throttle } from 'lodash-es'

// 多功能聊天框，支持文件上传，图片上传
const ChatTextArea: FC<ChatTextAreaProps> = ({
    value = "",
    onChange,
    onSend,
    onFileUpload,
    placeholder,
    disabled = false,
    fileConfig = {
        allowed_file_types: ['image', 'document', 'audio'],
        allowed_file_extensions: ['jpg', 'jpeg', 'png', 'pdf', 'txt', 'doc', 'docx', 'mp3', 'wav'],
        fileUploadConfig: {
            image_file_size_limit: 5, // 图片文件大小限制
            file_size_limit: 10, // 文件大小限制
            audio_file_size_limit: 10, // 音频文件大小限制
            video_file_size_limit: 50, // 视频文件大小限制
            workflow_file_upload_limit: 5 // 工作流文件上传限制
        }
    },
    enableFileUpload = true,
    maxLength = 2000,
    isStreaming = false,
    onStop
}) => {
    const { t } = useTranslation()
    const [query, setQuery] = useState<string>(value)
    
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const {
        fileStore, // 从useFile获取fileStore
        isDragActive,
        handleClipboardPasteFile,  // 处理粘贴文件
        handleDropFile, // 处理拖拽文件
        handleSelectFile, // 处理选择文件
        handleRemoveFile, // 处理移除文件
        handleReUploadFile, // 处理重新上传文件
        handleDragFileEnter, // 处理拖拽文件进入
        handleDragFileLeave, // 处理拖拽文件离开
        handleDragFileOver, // 处理拖拽文件悬停
    } = useFile({
        fileConfig,
        enableFileUpload,
        onFileUpload
    })

    // 自适应高度
    const handleTextareaResize = useCallback(() => {
        if (textareaRef.current) {
            // 先重置高度为auto以获取正确的scrollHeight
            textareaRef.current.style.height = 'auto'
            // 如果内容为空，设置最小高度，否则使用scrollHeight
            const minHeight = 64 // 最小高度
            const scrollHeight = textareaRef.current.scrollHeight
            textareaRef.current.style.height = `${Math.max(minHeight, scrollHeight)}px`
        }
    }, [])

    // 监听value变化和组件挂载，调整高度
    useEffect(() => {
        setQuery(value)
        // 延迟执行以确保DOM更新完成
        setTimeout(() => {
            handleTextareaResize()
        }, 0)
    }, [value, handleTextareaResize])

    // 处理输入变化
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        if (newValue.length <= maxLength) {
            setQuery(newValue)
            onChange?.(newValue)
            handleTextareaResize()
        }
    }, [onChange, maxLength, handleTextareaResize])

    // 处理键盘事件
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { // 按下Enter键且不是Shift键
            e.preventDefault()
            if (query.trim() || fileStore.files.length > 0) {
                onSend?.(query.trim(), fileStore.files)
                setQuery('')
                fileStore.setFiles([])
                handleTextareaResize()
            }
        }
    }, [query, fileStore, onSend, handleTextareaResize])

    // 处理粘贴事件
    const handlePaste = useCallback((e: ClipboardEvent<HTMLTextAreaElement>) => {
        if (enableFileUpload) {
            handleClipboardPasteFile(e)
        }
    }, [enableFileUpload, handleClipboardPasteFile])

    // 处理文件选择
    const handleFileSelect = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            Array.from(files).forEach(file => {
                handleSelectFile(file)
            })
        }
        // 清空input值，允许重复选择同一文件
        e.target.value = ''
    }, [handleSelectFile])

    // 发送消息
    const handleSend = useCallback(() => {
        if (query.trim() || fileStore.files.length > 0) {
            onSend?.(query.trim(), fileStore.files)
            setQuery('')
            fileStore.setFiles([])
            handleTextareaResize()
        }
    }, [query, fileStore, onSend, handleTextareaResize])

    const handleStop = useCallback(() => {
        onStop?.()
    }, [onStop])

    // 使用节流包装，防止短时间重复点击（这里设为 1000ms，可按需调整）
    const throttledHandleSend = useMemo(
        () => throttle(() => { handleSend() }, 1000, { trailing: false }),
        [handleSend]
    )
    const throttledHandleStop = useMemo(
        () => throttle(() => { handleStop() }, 1000, { trailing: false }),
        [handleStop]
    )

    // 组件卸载或依赖变更时清理节流定时器
    useEffect(() => {
        return () => {
            throttledHandleSend.cancel()
            throttledHandleStop.cancel()
        }
    }, [throttledHandleSend, throttledHandleStop])

    // 检查是否有内容可以发送
    const hasContent = query.trim() || fileStore.files.length > 0

    return (
        <div className="relative w-full">
            {/* 附件预览区域 */}
            {fileStore.files.length > 0 && (
                <div className="mb-1 w-full">
                    <FileList 
                        files={fileStore.files}
                        onRemove={handleRemoveFile}
                        onRetry={handleReUploadFile}
                    />
                </div>
            )}
            
            {/* 主输入区域 */}
            <div className={`relative border rounded-xl transition-all duration-200 ${
                isDragActive 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : hasContent 
                        ? 'border-blue-300 shadow-md' 
                        : 'border-gray-300'
            } ${disabled ? 'opacity-50' : ''}`}
            onDragEnter={handleDragFileEnter}
            onDragLeave={handleDragFileLeave}
            onDragOver={handleDragFileOver}
            onDrop={handleDropFile}
            >
                {/* 文本输入区域 */}
                <div className="flex-1 relative pb-4">
                    <textarea
                        ref={textareaRef}
                        className="w-full min-h-[64px] max-h-[200px] p-2 text-sm border-none outline-none resize-none bg-transparent placeholder-gray-400"
                        style={{
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            background: 'transparent'
                        }}
                        placeholder={placeholder || t('common.common.inputSearchQuestion')}
                        value={query}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        disabled={disabled}
                        maxLength={maxLength}
                    />
                    
                    {/* 工具栏 */}
                    <div className="absolute h-4 w-full bottom-1 right-1 flex items-center justify-end space-x-2">
                        {/* 字数统计 */}
                        <div className="text-xs text-gray-400">
                            {query.length}/{maxLength}
                        </div>
                        {/* 文件上传按钮 */}
                        {enableFileUpload && (
                            <button
                                onClick={handleFileSelect}
                                disabled={disabled}
                                className="border-none outline-none bg-transparent p-0 font-medium transition-all duration-200"
                                title={t('common.common.uploadFile')}
                            >
                                <RiAttachmentLine className="w-4 h-4 text-current"/>
                            </button>
                        )}
                        {/* 发送按钮 */}
                        {!isStreaming && <button
                            onClick={throttledHandleSend}
                            disabled={disabled || !hasContent}
                            className={`border-none outline-none bg-transparent p-0 font-medium transition-all duration-200 ${
                                hasContent && !disabled
                                    ? 'hover:text-blue-600 hover:bg-blue-50 transition-colors'
                                    : 'text-gray-600 cursor-not-allowed'
                            }`}
                            style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                boxShadow: 'none'
                            }}
                            title={hasContent && !disabled ? t('common.common.send') : t('common.common.noContentCannotSend')}
                        >
                            <RiSendPlaneFill className="w-4 h-4 text-current"/>
                        </button>}

                        {/* 停止按钮：仅在流式进行时显示 */}
                        {isStreaming && (
                            <button
                                onClick={throttledHandleStop}
                                className="border-none outline-none bg-transparent p-0 font-medium transition-all duration-200 hover:text-red-600 hover:bg-red-50 transition-colors"
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    boxShadow: 'none'
                                }}
                                title={t('common.common.stop')}
                            >
                                <RiStopCircleLine className="w-4 h-4 text-current"/>
                            </button>
                        )}
                    </div>
                </div>
                {/* 隐藏的文件输入 */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={fileConfig.allowed_file_extensions?.map(ext => `.${ext}`).join(',')}
                    onChange={handleFileInputChange}
                    className="hidden"
                />
            </div>
        </div>
    )
}

export default ChatTextArea
