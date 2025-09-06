import { get, post, put, del } from "./base"
import { TreeNodeData } from "@/components/Home/left/index"
import Toast from "@/components/base/Toast"
import i18n from '@/i18n/i18next-config'

// 定义树节点的类型
export interface TreeNode {
  key: string
  title: string
  children?: TreeNode[]
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

export const getFileTree = async (): Promise<TreeNodeData[]> => {
  try {
    // 假设 get 函数返回 Promise<FileTreeResponse>
    const res: ApiResponse<TreeNodeData[]> = await get('filesystem/tree');
    // 检查业务是否成功（根据后端实际状态码判断）
    if (res.status !== "success") {
      Toast.notify({type: "error", message: `获取文件树失败: ${res.message}`});
    }
    return res.data; // 只返回核心数据
  } catch (error) {
    throw error;
  }
}

// 新建文件夹
export const createDir = async (parentId: string, name: string) => {
  return post(`filesystem/folder`, { body: { name, parentId }});
}

// 新建文件
export const createFile = async (parentId: string, name: string, content: string, mimeType: string) => {
  return post(`filesystem/file`, { body: { name, parentId, content, mimeType }})
}

// 重命名
export const renameNode = async (nodeId: string, name: string) => {
  return put(`filesystem/rename/${nodeId}`, { body: { newName: name }})
}

// 删除
export const deleteNode = async (nodeId: string) => {
  return del(`filesystem/${nodeId}`)
}

// 获取文件内容
export const getFileContent = async (nodeId: string): Promise<ApiResponse<FileInfo>> => {
  try {
    // 使用ky客户端直接请求，浏览器会自动处理gzip解压
    const response: ApiResponse<FileInfo> = await get(`filesystem/file/${nodeId}`, {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'application/json'
      }
    })
    
    // ky会自动处理压缩响应的解压，直接解析JSON
    return response
  } catch (error) {
      Toast.notify({ type: 'error', message: i18n.t('operate.error.getFileContentFailed') });
      throw error
    }
}

// 更新文件内容
export const updateFileContent = async (nodeId: string, content: string): Promise<{ success: boolean }> => {
  return put(`filesystem/file/${nodeId}`,{body: { content }})
}
