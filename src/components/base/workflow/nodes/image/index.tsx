import { useEffect, useRef, useState, useMemo } from 'react'
import { RiCloseCircleLine } from '@remixicon/react'
import { ImageNodeType } from "./types"
import { useReactFlow } from 'reactflow';
import useImage from './hooks'
import { API_PREFIX } from '@/constant';
import { fileUploadRequest } from '@/service/llm';
import type { FileUploadOptions } from "@/components/base/ChatTextArea/types"


const ImageNode = ({ id, data }: { id: string, data: ImageNodeType }) => {
  const { setNodes } = useReactFlow()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState(data.image?.url)
  // 处理文件上传
  const handleFileUpload = (options: FileUploadOptions) => {
    fileUploadRequest(`${API_PREFIX}/upload/file`, options)
  };
  const { image, handleLocalFileUpload } = useImage(handleFileUpload, setImageUrl)
  useEffect(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, image: { url: imageUrl } } } : node
      )
    )
  }, [imageUrl])

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleLocalFileUpload(file);
    }
    // 清空input值，允许重复选择同一文件
    e.target.value = '';
  };

  const a = useMemo(() => {
    return ( image?.progress || 0 ) / 100 * 360
  }, [image?.progress])

  return (
    <div className="p-2">
      {imageUrl ? (
        <div className="relative w-full h-full rounded-md shadow-xs flex-shrink-0">
          <img src={image?.base64Url || imageUrl}  style={{ width: `${(data.width) || 180}px`, height: `${((data.height) || 128) - 48}px` }} className="w-full h-full object-fill rounded-md" />
          {/* 删除图标 */}
          {(image?.status !== "uploading") && <RiCloseCircleLine className="absolute z-3 top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 text-text-primary cursor-pointer" onClick={() => setImageUrl('')} />}
        </div> 
      ) : (
        <div
          className="flex items-center justify-center border-2 rounded-md border-dashed border-primary cursor-pointer"
          style={{ width: `${((data.width) || 180) - 26 }px`, height: `${((data.height) || 128) - 48}px` }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-text-primary-200 text-xs">点击上传图片</div>
        </div>
      )}
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={'.jpg,.jpeg,.png,.gif,.webp'}
        onChange={handleImageInputChange}
        className="hidden"
      />
    </div>
  )
}

export default ImageNode
