import { v4 as uuid4 } from 'uuid';
import { useState } from 'react'
import Toast from '@/components/base/Toast';
import type { FileEntity, FileUploadOptions } from "@/components/base/ChatTextArea/types"

const useImage = (onFileUpload: (param: FileUploadOptions) => void, setImageUrl: (url: string) => void) => {
    const [image, setImage] = useState<FileEntity>()

    const handleLocalFileUpload = (file: File) => {
        // 1. 创建文件实体
        const fileEntity: FileEntity = {
            id: uuid4(),
            name: file.name,
            type: file.type,
            size: file.size,
            progress: 0,
            transferMethod: 'normal',
            supportFileType: 'image',
            originalFile: file,
            base64Url: '',
            url: undefined,
            uploadedId: undefined,
            status: 'pending'
        }
        setImage(fileEntity)

        const reader = new FileReader()
        reader.addEventListener("load", () => {
            fileEntity.base64Url = reader.result as string
            setImage(fileEntity)

            onFileUpload!({
                file: fileEntity,
                onProgressCallback: (progress: number) => {
                },
                onSuccessCallback: (res: any) => {
                    // 上传成功
                    fileEntity.progress = 100
                    fileEntity.status = 'success'
                    fileEntity.url = res.fileInfo.url
                    fileEntity.uploadedId = res.fileInfo.id
                    setImageUrl(res.fileInfo.url)  // 成功后更新URL
                    setImage(fileEntity)
                },
                onErrorCallback: () => {
                    // 更新错误状态
                    fileEntity.progress = -1
                    fileEntity.status = 'failed'
                    setImage(fileEntity)
                },
                onStopCallback: (cancel: () => void) => {
                    fileEntity.cancelUpload = cancel
                    setImage(fileEntity)
                },
            })
        })
        reader.addEventListener(
            'error',
            () => {
                Toast.notify({ type: 'error', message: "图片预览失败" })
            },
            false,
        )
        reader.readAsDataURL(file)
    }

    return {
        image,
        handleLocalFileUpload,
    }
}

export default useImage