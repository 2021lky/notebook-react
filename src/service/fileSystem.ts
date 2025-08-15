import { get, post, put, del } from "./base"
import { TreeNodeData } from "@/components/Home/left/index"
import Toast from "@/components/base/toast"
import i18n from '@/i18n/i18next-config'

// 定义树节点的类型
export interface TreeNode {
  key: string
  title: string
  children?: TreeNode[]
}

export const getFileTree = async (): Promise<{ data: TreeNodeData[] }> => {
  return get('filesystem/tree').json<{ data: TreeNodeData[] }>()
}

// 新建文件夹
export const createDir = async (parentId: string, name: string) => {
  return post(`filesystem/folder`, { name, parentId })
}

// 新建文件
export const createFile = async (parentId: string, name: string, content: string, mimeType: string) => {
  return post(`filesystem/file`, { name, parentId, content, mimeType })
}

// 重命名
export const renameNode = async (nodeId: string, name: string) => {
  return put(`filesystem/rename/${nodeId}`, { newName: name })
}

// 删除
export const deleteNode = async (nodeId: string) => {
  return del(`filesystem/${nodeId}`)
}

// 文件信息接口
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  path: string;
  storage_type: string;
  file_path: string;
  created_at: string;
  updated_at: string;
  content: string;
}

// API响应接口
export interface ApiResponse<T> {
  status: string;
  message: string;
  timestamp: string;
  data: T;
}

// 获取文件内容
export const getFileContent = async (nodeId: string): Promise<ApiResponse<FileInfo>> => {
  try {
    // 使用ky客户端直接请求，浏览器会自动处理gzip解压
    const response = await get(`filesystem/file/${nodeId}`, {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'application/json'
      }
    })
    
    // ky会自动处理压缩响应的解压，直接解析JSON
    return response.json<ApiResponse<FileInfo>>()
  } catch (error) {
      Toast.notify({ type: 'error', message: i18n.t('operate.error.getFileContentFailed') });
      throw error
    }
}

// 更新文件内容
export const updateFileContent = async (nodeId: string, content: string): Promise<{ success: boolean }> => {
  return put(`filesystem/file/${nodeId}`, { content }).json<{ success: boolean }>()
}
