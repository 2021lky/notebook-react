import { useState, useCallback, useRef } from 'react';
import { FileEntity, FileConfig, FileUploadOptions, ChatSendOptions, CustomChatSendCallback } from '../types';
import { uuid4 } from './utils';
import Toast from '@/components/base/Toast';
import { isUpLoadAllow, getSupportFileType } from './utils';

type UseFileProps = {
    onFileUpload: (param: FileUploadOptions) => void;
    onSend: (param: ChatSendOptions) => void;
    fileConfig: FileConfig;
    enableFileUpload?: boolean;
    customChatSendCallback: CustomChatSendCallback
}

const useFile = ({ onFileUpload, onSend, fileConfig, enableFileUpload, customChatSendCallback }: UseFileProps) => {
    // 1. 文件管理
    const [files, setFiles] = useState<FileEntity[]>([]);
    const abortController = useRef<AbortController | null>(null);

    const addFile = (file: FileEntity) => {
        // 文件数量限制
        if (files.length >= fileConfig.fileUploadConfig.file_count_limit) {
            Toast.notify({ type: 'error', message: '文件数量超出限制' })
            return;
        }
        // 文件大小，类型，后缀名限制
        if (!isUpLoadAllow(fileConfig, file)) {
            return;
        }
        // 检查文件是否已存在
        if (files.find((f) => f.id === file.id)) {
            Toast.notify({ type: 'error', message: '文件已存在' })
            return;
        }
        setFiles((prevFiles) => [...prevFiles, file]);
    }

    const removeFile = (fileId: string) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    }

    const updateFile = (file: FileEntity) => {
        setFiles((prevFiles) => prevFiles.map((f) => (f.id === file.id ? { ...f, ...file } : f)));
    };

    const clearFiles = () => {
        setFiles([])
    }

    // 2. 文件上传
    // （1） 从本地上传 normal
    const handleLocalFileUpload = (file: File, isRetry?: boolean, fileId?: string) => {
        if (!enableFileUpload) {
            Toast.notify({ type: 'error', message: '文件上传已禁用' })
            return
        }
        if (isRetry && !fileId) {
            Toast.notify({ type: 'error', message: '重试失败，重试接口缺少文件id字段' })
            return
        }
        // 1. 创建文件实体
        const fileEntity: FileEntity = {
            id: !isRetry ? uuid4() : fileId!,
            name: file.name,
            type: file.type,
            size: file.size,
            progress: 0,
            transferMethod: 'normal',
            supportFileType: getSupportFileType(file.type, file.name),
            originalFile: file,
            base64Url: '',
            url: undefined,
            uploadedId: undefined,
            status: 'pending'
        }
        if (!isRetry) {
            // 2. 验证
            if (files.length >= fileConfig.fileUploadConfig.file_count_limit) {
                Toast.notify({ type: 'error', message: '文件数量超出限制' })
                return;
            }
            if (!isUpLoadAllow(fileConfig, fileEntity)) {
                return;
            }
            // 3. 新增文件
            addFile(fileEntity)
        } else {
            updateFile(fileEntity)
        }

        // 4. 如果是上传图片，需要创建FileReader进行base64编码
        const isImage = fileEntity.supportFileType === "image"
        if (isImage) {
            const reader = new FileReader() // 图片需要base64编码
            // 文件读取成功完成后触发
            reader.addEventListener("load", () => {
                // 通过 reader.result 可以获取文件的读取内容
                fileEntity.base64Url = reader.result as string
                updateFile(fileEntity)

                onFileUpload!({
                    file: fileEntity,
                    onProgressCallback: (progress: number) => {
                        // 更新进度，确保进度值在0-100之间
                        const normalizedProgress = Math.min(Math.max(progress, 0), 100)
                        fileEntity.progress = normalizedProgress
                        fileEntity.status = 'uploading'
                        updateFile(fileEntity)
                    },
                    onSuccessCallback: (res: any) => {
                        // 上传成功
                        fileEntity.progress = 100
                        fileEntity.status = 'success'
                        fileEntity.url = res.url
                        fileEntity.uploadedId = res.id  // 这里是后端识别的id，区别于前端id
                        updateFile(fileEntity)
                    },
                    onErrorCallback: () => {
                        // 更新错误状态
                        fileEntity.progress = -1
                        fileEntity.status = 'failed'
                        updateFile(fileEntity)
                    },
                    onStopCallback: (cancel) => {
                        fileEntity.cancelUpload = cancel
                        updateFile(fileEntity)
                    },
                })
            })
            // 文件读取失败触发
            reader.addEventListener(
                'error',
                () => {
                    Toast.notify({ type: 'error', message: "图片预览失败" })
                    removeFile(fileEntity.id)
                },
                false,
            )
            reader.readAsDataURL(file) // 将文件读取为 base64 编码的字符串（可用于图片预览）
        } else {
            onFileUpload!({
                file: fileEntity,
                onProgressCallback: (progress: number) => {
                    // 更新进度，确保进度值在0-100之间
                    const normalizedProgress = Math.min(Math.max(progress, 0), 100)
                    fileEntity.progress = normalizedProgress
                    fileEntity.status = 'uploading'
                    updateFile(fileEntity)
                },
                onSuccessCallback: (res: any) => {
                    // 上传成功
                    fileEntity.progress = 100
                    fileEntity.status = 'success'
                    fileEntity.url = res.url
                    fileEntity.uploadedId = res.id  // 这里是后端识别的id，区别于前端id
                    fileEntity.cancelUpload = undefined
                    updateFile(fileEntity)
                },
                onErrorCallback: (error: Error) => {
                    // 更新错误状态
                    fileEntity.progress = -1
                    fileEntity.status = 'failed'
                    fileEntity.cancelUpload = undefined
                    updateFile(fileEntity)
                    Toast.notify({ type: "error", message: error.message })
                },
                onStopCallback: (cancel) => {
                    fileEntity.cancelUpload = cancel
                    updateFile(fileEntity)
                },
            })
        }
    }
    // (2) 分块上传
    // 3. 拖拽文件上传
    // dragstart：事件主体是被拖放元素，在开始拖放被拖放元素时触发。
    // darg：事件主体是被拖放元素，在正在拖放被拖放元素时触发。
    // dragenter：事件主体是目标元素，在被拖放元素进入某元素时触发。
    // dragover：事件主体是目标元素，在被拖放在某元素内移动时触发。
    // dragleave：事件主体是目标元素，在被拖放元素移出目标元素是触发。
    // drop：事件主体是目标元素，在目标元素完全接受被拖放元素时触发。
    // dragend：事件主体是被拖放元素，在整个拖放操作结束时触发。
    const [isDragActive, setIsDragActive] = useState<boolean>(false)

    const handleDragFileEnter = useCallback((e: React.DragEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (enableFileUpload)
            setIsDragActive(true)
    }, [enableFileUpload])

    const handleDragFileOver = useCallback((e: React.DragEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDragFileLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (enableFileUpload)
            setIsDragActive(false)
    }, [enableFileUpload])

    const handleDropFile = useCallback((e: React.DragEvent<HTMLElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (enableFileUpload)
            setIsDragActive(false)

        // 选择粘贴板中的第一个文件
        const file = e.dataTransfer.files[0]

        if (enableFileUpload && file)
            handleLocalFileUpload(file)
    }, [enableFileUpload, handleLocalFileUpload])

    // 4. 发送消息
    const [isResponsing, setIsResponsing] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)

    const handleSend = (query: string, filesId: string[]) => {
        onSend({
            query, filesId,
            onChunkCallback: (content: string) => {
                customChatSendCallback.onChunkCallback?.(content)
            },
            onSuccessCallback: () => {
                setIsResponsing(false);
                abortController.current = null;
                customChatSendCallback.onSuccessCallback?.()
            },
            onErrorCallback: (error: Error) => {
                setIsResponsing(false);
                setIsError(true)
                abortController.current = null;
                customChatSendCallback.onErrorCallback?.(error)
                Toast.notify({ type: "error", message: error.message })
            },
            onStartCallback: (requestId: string) => {
                setIsResponsing(true);
                setIsError(false);
                customChatSendCallback.onStartCallback?.(requestId);
            },
            getAbortController: (controller: AbortController) => {
                abortController.current = controller;
            }
        })
        setFiles([])
    }

    const handleStop = () => {
        customChatSendCallback.onStopCallback?.()
        if(abortController.current){
            abortController.current.abort();
            setIsResponsing(false)
        }
    }
    return {
        files,
        addFile,
        removeFile,
        clearFiles,
        handleLocalFileUpload,
        isDragActive,
        setIsDragActive,
        handleDragFileEnter,
        handleDragFileOver,
        handleDragFileLeave,
        handleDropFile,
        handleSend,
        isResponsing,
        isError,
        handleStop
    }
}

export default useFile

// 1. 闭包导致的旧值问题，主要体现在上传回调（onProgressCallback、onSuccessCallback、onErrorCallback）中对 fileEntity 的引用上