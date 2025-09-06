import { FileEntity } from './types';
import { RiCloseCircleLine, RiRefreshLine } from '@remixicon/react';
import { formatFileSize, getUploadStatus } from './hooks/utils';
import { useMemo } from 'react';
import pdfIcon from '@/assets/pdf.png'
import wordIcon from '@/assets/word.webp'
import excelIcon from '@/assets/excel.jpeg'
import markdownIcon from '@/assets/markdown.ico'
import textIcon from '@/assets/text.webp'

type FileItemProps = {
    file: FileEntity;
    onRemove: () => void;
    onRetry?: () => void;
}

const ImagePreview = ({ file, onRemove, onRetry }: FileItemProps) => {
    const a = useMemo(() => {
        return file.progress / 100 * 360
    }, [file.progress])
    return (
        <div className="relative w-16 h-16 rounded-md shadow-xs flex-shrink-0">
            <img src={file.base64Url} alt={file.name} className="absolute inset-0 w-full h-full object-cover rounded-md" />

            {/* 进度条蒙层 */}
            {(file.status !== "success" && a < 360) && (<div className="absolute inset-0 z-2 flex items-center justify-center rounded-md bg-black/50">
                {/* 使用svg绘制圆形进度条 */}
                {file.status === "uploading" && <svg className="w-10 h-10" viewBox="0 0 100 100">
                    <path
                        fill="#e5e5e5"
                        d={`
                        M 50 50 
                        L 50 5
                        A 45 45 0 ${a > 180 ? 1 : 0} 1 ${50 + 45 * Math.cos((a - 90) * Math.PI / 180)} ${50 + 45 * Math.sin((a - 90) * Math.PI / 180)}
                        Z`}
                    />
                </svg> }
            </div>)}
            {/* 删除图标 */}
            { (file.cancelUpload || file.status !== "uploading") && <RiCloseCircleLine className="absolute z-3 top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 text-text-primary cursor-pointer" onClick={() => onRemove()} /> }
            {file.status === "failed" && <RiRefreshLine
                onClick={() => onRetry?.()}
                className="absolute z-3 w-6 h-6 top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer"
            />}
        </div>
    )
}

const FilePreview = ({ file, onRemove, onRetry }: FileItemProps) => {
    // 根据文件类型获取图标
    const getFileIcon = (file: FileEntity) => {
        const extension = file.name.split('.').pop()?.toLowerCase() // 文件后缀名
        const mimeType = file.type.toLowerCase() // 文件类型

        // 根据文件扩展名或MIME类型返回对应图标
        if (mimeType.includes('pdf') || extension === 'pdf') {
            return pdfIcon
        }
        if (mimeType.includes('word') || ['doc', 'docx'].includes(extension || '')) {
            return wordIcon
        }
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || ['xls', 'xlsx'].includes(extension || '')) {
            return excelIcon
        }
        if (extension === 'md' || extension === 'markdown') {
            return markdownIcon
        }
        if (mimeType.includes('text') || ['txt', 'log'].includes(extension || '')) {
            return textIcon
        }
        // 默认返回文本图标
        return textIcon
    }

    return (
        <div
            key={file.id}
            className="relative w-48 h-16 flex items-center space-x-1 bg-white rounded-lg border shadow-sm max-w-xs flex-shrink-0"
        >
            {/* 文件图标或图片预览 */}
            <img src={getFileIcon(file)} alt={file.name} className="w-12 h-15 object-cover rounded-lg" />

            {/* 文件信息 */}
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                </div>
                <div className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                </div>
                <div className={`text-xs ${getUploadStatus(file).color}`}>
                    {getUploadStatus(file).text}
                </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex w-4 h-4" title="删除">
                {/* 删除按钮 */}
                <RiCloseCircleLine
                    onClick={() => onRemove()}
                    className="w-4 h-4 cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                />
            </div>
            {file.status === "failed" && <div className="flex w-4 h-4" title="重试">
                {/* 重试按钮 */}
                <RiRefreshLine
                    onClick={() => onRetry?.()}
                    className="w-4 h-4 cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                />
            </div>}
        </div>
    )
}

const FileItem = ({ file, onRemove, onRetry }: FileItemProps) => {

    return (
        file.supportFileType === "image" ? (
            <ImagePreview file={file} onRemove={onRemove} onRetry={onRetry} />
        ) : (
            <FilePreview file={file} onRemove={onRemove} onRetry={onRetry} />
        )
    )
}

FileItem.displayName = 'FileItem';
export default FileItem;
