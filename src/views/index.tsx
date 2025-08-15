import DragDivider from "@/components/base/drag-divider"
import LeftTree from "@/components/Home/left"
import { FileTreeProvider, useFileTree } from "@/contexts/file-tree-context"
import { useState, useEffect } from "react"
import { TreeNodeData } from "@/components/Home/left/index"
import ContentRight from "@/components/Home/right"
import { SELECTED_KEY_STORAGE } from "@/constant"
import { useTranslation } from "react-i18next"

// 内部组件，使用上下文
const HomeContent = () => {
    const { treeData, isLoading } = useFileTree()
    const { t } = useTranslation()
    const [selectedKey, setSelectedKey] = useState<string>('')
    const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null)
    
    // localStorage key for storing selected tree node
    
    
    // 查找第一个文件夹（非叶子节点）
    const findFirstFolder = (nodes: TreeNodeData[]): string | null => {
        for (const node of nodes) {
            if (!node.isLeaf) {
                return node.key
            }
            if (node.children && node.children.length > 0) {
                const result = findFirstFolder(node.children)
                if (result) return result
            }
        }
        return null
    }
    
    // 根据key查找节点
    const findNodeByKey = (nodes: TreeNodeData[], key: string): TreeNodeData | null => {
        for (const node of nodes) {
            if (node.key === key) {
                return node
            }
            if (node.children && node.children.length > 0) {
                const result = findNodeByKey(node.children, key)
                if (result) return result
            }
        }
        return null
    }
    
    // 当文件树数据加载完成时，从localStorage恢复选中状态或设置默认选中第一个文件夹
    useEffect(() => {
        if (treeData && treeData.length > 0 && !selectedKey) {
            // 尝试从localStorage恢复上次选中的key
            const savedKey = localStorage.getItem(SELECTED_KEY_STORAGE)
            let keyToSelect = null
            
            if (savedKey) {
                // 检查保存的key是否在当前树中存在
                const savedNode = findNodeByKey(treeData, savedKey)
                if (savedNode) {
                    keyToSelect = savedKey
                    // Restored selected key from localStorage
                }
            }
            
            // 如果没有保存的key或保存的key不存在，选择第一个文件夹
            if (!keyToSelect) {
                keyToSelect = findFirstFolder(treeData)
                // Selected first folder as default
            }
            
            if (keyToSelect) {
                setSelectedKey(keyToSelect)
                const node = findNodeByKey(treeData, keyToSelect)
                setSelectedNode(node)
            }
        }
    }, [treeData, selectedKey])
    
    // 当selectedKey变化时，更新selectedNode
    useEffect(() => {
        if (treeData && selectedKey) {
            const node = findNodeByKey(treeData, selectedKey)
            setSelectedNode(node)
        }
    }, [treeData, selectedKey])
    
    // 处理树节点选择
    const handleTreeSelect = (selectedKey: string) => {
        setSelectedKey(selectedKey)
        // 保存选中的key到localStorage
        if (selectedKey) {
            localStorage.setItem(SELECTED_KEY_STORAGE, selectedKey)
            // Saved selected key to localStorage
        } else {
            localStorage.removeItem(SELECTED_KEY_STORAGE)
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-500">{t('common.common.loadingFileTree')}</div>
            </div>
        )
    }

    return (
         <div className="w-full h-full rounded-xl"
         style={{ 
             border: '1px solid #e5e5e5'
         }}>
             <DragDivider 
                 classNameWrapper="w-full h-full"
                 childrenLeft={<LeftTree data={treeData || []} onSelect={handleTreeSelect} defaultSelectedKey={selectedKey}/>}
                 childrenRight={
                    <ContentRight selectedNode={selectedNode} />
                 }
                 minLeftWidth={200}
             />
         </div>
     )
}

// 外部组件，提供上下文
const Home = () => {
    return (
        <FileTreeProvider>
            <HomeContent />
        </FileTreeProvider>
    )
}

export default Home