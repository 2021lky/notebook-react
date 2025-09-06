
import { useRef, useCallback, useEffect, KeyboardEvent, useState, CompositionEvent, ChangeEvent, ClipboardEvent } from 'react';
import TextArea from '@/components/base/TextArea';
import { ChatSendOptions, FileConfig, FileUploadOptions, CustomChatSendCallback } from './types';
import useFile from "./hooks/use-file"
import { RiAttachmentLine, RiSendPlaneFill, RiStopCircleLine } from '@remixicon/react';
import Button from '@/components/base/Button';
import FileItem from './fileItem';

const defaultFileConfig: FileConfig = {
    allowed_file_types: ["image", "document"],  // 支持文件类型，目前只支持这两种
    allowed_file_extensions: ["jpg", "jpeg", "png", "gif", "doc", "docx", "pdf", "xls", "xlsx"], // 允许上传的文件扩展名
    fileUploadConfig: {
        image_file_size_limit: 5, // 图片文件大小限制, 单位MB
        audio_file_size_limit: 10, // 音频文件大小限制, 单位MB
        video_file_size_limit: 100, // 视频文件大小限制, 单位MB
        document_file_size_limit: 100, // 文档文件大小限制, 单位MB
        file_count_limit: 3, // 文件数量限制
    }
}

type ChatTextAreaProps = {
    value: string;
    onSend: (param: ChatSendOptions) => void;
    customChatSendCallback: CustomChatSendCallback;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onFileUpload: (param: FileUploadOptions) => void;
    fileConfig?: FileConfig;
    enableFileUpload?: boolean;
    adjustHeight?: boolean;  // 是否支持自动调整高度
    maxHeight?: number;  // 最大高度
    minHeight?: number;  // 最小高度
    wrapperClassName?: string;
    className?: string;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'>;

const ChatTextArea = ({ value, onSend, onChange, onFileUpload, customChatSendCallback, fileConfig = defaultFileConfig, enableFileUpload = true, adjustHeight, maxHeight, minHeight, wrapperClassName, className, disabled, ...props }: ChatTextAreaProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const {
        files,
        isDragActive,
        removeFile,
        handleLocalFileUpload,
        handleDragFileEnter,
        handleDragFileOver,
        handleDragFileLeave,
        handleDropFile,
        isResponsing,
        handleSend,
        handleStop
    } = useFile({ onFileUpload, onSend, fileConfig, enableFileUpload, customChatSendCallback })

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            handleLocalFileUpload(file);
        }
        // 清空input值，允许重复选择同一文件
        e.target.value = '';
    };

    // 自适应高度
    const handleTextareaResize = useCallback(() => {
        if (!adjustHeight) {
            return
        }
        if (textareaRef.current) {
            // 先重置高度为auto以获取正确的scrollHeight
            textareaRef.current.style.height = 'auto'
            // 如果内容为空，设置最小高度，否则使用scrollHeight
            const scrollHeight = textareaRef.current.scrollHeight
            textareaRef.current.style.height = `${Math.max(minHeight || 64, Math.min(maxHeight || 200, scrollHeight))}px`
        }
    }, [adjustHeight, maxHeight, minHeight])

    // 监听value变化，自动调整高度
    useEffect(() => {
        // 延迟执行以确保DOM更新完成
        setTimeout(() => {
            handleTextareaResize()
        }, 0)
    }, [value])

    // 处理发送消息逻辑
    const hasContent = value.trim().length > 0 || files.length > 0
    const handleSendMessage = () => {
        // 等待 handleSend 完成其异步操作
        handleSend(value, files.length > 0 ? files.map(v => v.uploadedId!) : []);
        onChange({
            target: {
                value: '',
            }
        } as React.ChangeEvent<HTMLTextAreaElement>);
    }

    // 处理键盘事件
    const [isComposing, setIsComposing] = useState<boolean>(false);
    const [composingValue, setComposingValue] = useState<string>('');
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (isComposing) {
            setComposingValue(e.target.value);
        } else {
            onChange(e);
        }
    };
    const handleCompositionStart = (e: CompositionEvent<HTMLTextAreaElement>) => {
        setIsComposing(true);
        // 记录组合开始时的值
        setComposingValue(e.currentTarget.value);
    };

    const handleCompositionEnd = (e: CompositionEvent<HTMLTextAreaElement>) => {
        setIsComposing(false);
        // 组合结束后更新最终值
        onChange({
            target: {
                value: e.currentTarget.value,
            }
        } as React.ChangeEvent<HTMLTextAreaElement>);
        setComposingValue('');
    };

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isComposing && e.key === 'Enter' && !e.shiftKey) { // 按下Enter键且不是Shift键
            e.preventDefault()
            if (value.trim() || files.length > 0) {
                handleSendMessage()
            }
        }
    }, [onSend, isComposing])

    // 处理粘贴事件
    const handlePaste = useCallback((e: ClipboardEvent<HTMLTextAreaElement>) => {
        if (enableFileUpload) {
            const file = e.clipboardData?.files[0]
            if (file) {
                e.preventDefault()
                handleLocalFileUpload(file)
            }
        }
    }, [enableFileUpload, handleLocalFileUpload])

    return (
        <div className={`relative w-full ${wrapperClassName}`}>
            {/* 文件预览区域 */}
            <div className="flex items-center gap-2 pt-2 overflow-x-auto">
                {
                    files.map((file) => (
                        <FileItem
                            key={file.id}
                            file={file}
                            onRemove={() => {
                                if (file.status === 'uploading') {
                                    file.cancelUpload?.()
                                }
                                removeFile(file.id)
                            }}
                        />
                    ))
                }
            </div>
            {/* 主输入区 */}
            <div className={`
                relative border rounded-xl border-border-color hover:border-border-dark bg-primary-50 transition-all duration-200 
                ${disabled ? 'opacity-50' : ''}
                ${isDragActive ? 'border-border-dark bg-primary-200 shadow-lg' : ''}  ${className}`}
                onDragEnter={handleDragFileEnter}
                onDragLeave={handleDragFileLeave}
                onDragOver={handleDragFileOver}
                onDrop={handleDropFile}
            >
                {/* 文本输入区域 */}
                <div className="flex-1 relative pb-4">
                    <TextArea
                        ref={textareaRef}
                        className={`w-full p-2 text-sm border-none outline-none resize-none bg-primary-50 placeholder-text-secondary`}
                        style={{
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            background: 'transparent'
                        }}
                        placeholder={props.placeholder || '请输入问题'}
                        value={isComposing ? composingValue : value}
                        onChange={(e) => {
                            handleChange(e)
                        }}
                        // onKeyDown={handleKeyDown}
                        // onPaste={handlePaste}
                        disabled={disabled}
                        maxLength={props.maxLength || 500}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        onCompositionStart={handleCompositionStart}
                        onCompositionEnd={handleCompositionEnd}
                    />

                    {/* 工具栏 */}
                    <div className="absolute h-4 w-full bottom-1 right-1 flex items-center justify-end space-x-2">
                        {/* 字数统计 */}
                        <div className="text-xs text-text-secondary">
                            {value.length}/{props.maxLength || 500}
                        </div>
                        {/* 文件上传按钮 */}
                        {enableFileUpload && (
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled}
                                className="border-none outline-none bg-transparent p-0 font-medium shadow-none transition-all duration-200"
                                title="上传文件"
                            >
                                <RiAttachmentLine className="w-4 h-4 text-text-primary" />
                            </Button>
                        )}
                        {/* 发送按钮 */}
                        {!isResponsing && (
                            <Button
                                throttle
                                onClick={handleSendMessage}
                                disabled={!hasContent || disabled}
                                className={`border-none outline-none bg-transparent p-0 font-medium shadow-none transition-all duration-200 
                                ${hasContent && !disabled ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                title={hasContent && !disabled ? "发送" : "无内容"}
                            >
                                <RiSendPlaneFill className="w-4 h-4 text-text-primary" />
                            </Button>
                        )}

                        {/* 停止按钮：仅在流式进行时显示 */}
                        {isResponsing && (
                            <Button
                                throttle
                                onClick={handleStop}
                                className="border-none outline-none bg-transparent p-0 font-medium shadow-none transition-all duration-200 hover:text-error transition-colors"
                                title="停止"
                            >
                                <RiStopCircleLine className="w-4 h-4 text-text-primary" />
                            </Button>
                        )}
                    </div>
                </div>
                {/* 隐藏的文件输入 */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={fileConfig.allowed_file_extensions?.map(ext => `.${ext}`).join(',')}
                    onChange={handleFileInputChange}
                    className="hidden"
                />
            </div>
        </div>
    );
};

ChatTextArea.displayName = 'ChatTextArea';
export default ChatTextArea;