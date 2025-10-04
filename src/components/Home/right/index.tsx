import { useState, useRef, useEffect } from 'react';
import { TreeNodeData } from '../left';
import LLMSidebar from './llm-sidebar';
import FloatingButton from './FloatingButton';
import TextSelectionBubble from './TextSelectionBubble';
import EditorComponent from "@/components/function/editor";
import { getFileContent, updateFileContent, type FileInfo } from '@/service/fileSystem';
import Toast from '@/components/base/Toast';
import { useTranslation } from 'react-i18next';
import Button from "@/components/base/Button"
import Workflow from "@/components/base/workflow"
import { saveWorkflow, getWorkflow } from '@/service/fileSystem';
import type { Node, Edge } from "@/components/base/workflow/types"
import { initialNode, initialEdge } from "@/components/base/workflow/contents"

type Props = {
  selectedNode: TreeNodeData | null;
}
const ContentRight = ({ selectedNode }: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 });
  const [initialText, setInitialText] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setInitialText(''); // 关闭侧边栏时清空初始文本
  };

  const handleAISearch = (text: string) => {
    setInitialText(text);
    setIsSidebarOpen(true);
    setSelectedText(''); // 清空选中文本
  };

  const handleCloseBubble = () => {
    setSelectedText('');
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // 如果点击的不是气泡本身，则关闭气泡
    const target = e.target as HTMLElement;
    if (!target.closest('.text-selection-bubble')) {
      setSelectedText('');
    }
  };

  const handleEditorTextSelection = (selectedText: string, position: { x: number; y: number }) => {
    if (selectedText.trim()) {
      setSelectedText(selectedText);
      setBubblePosition(position);
    }
  };

  // 加载文件内容
  const loadFileContent = async (nodeId: string) => {
    if (!nodeId) return;

    setIsLoading(true);
    try {
      const response = await getFileContent(nodeId);

      // 保存文件信息
      setFileInfo(response.data);
      // 后端现在直接返回content字段
      if (response.data && response.data.content !== undefined) {
        setFileContent(response.data.content);
      } else {
        throw new Error('文件内容为空或格式无效');
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      Toast.notify({ type: 'warning', message: t('operate.error.fileLoadFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  // 保存文件内容
  const saveFileContent = async (nodeId: string, content: string) => {
    if (!nodeId) return;

    try {
      await updateFileContent(nodeId, content);
      setHasUnsavedChanges(false);
      Toast.notify({ type: 'success', message: t('operate.success.fileSaved') });
    } catch (error) {
      Toast.notify({ type: 'error', message: t('operate.error.fileSaveFailed') });
    }
  };

  // 监听selectedNode变化，加载文件内容
  useEffect(() => {
    if (selectedNode?.key && selectedNode.isLeaf) {
      loadFileContent(selectedNode.key);
    } else {
      setFileContent('');
      setHasUnsavedChanges(false);
    }
  }, [selectedNode?.key]);

  const handleContentChange = (content: string) => {
    setFileContent(content);
    setHasUnsavedChanges(true);
  };

  // 手动保存文件
  const handleSaveFile = () => {
    if (selectedNode?.key && hasUnsavedChanges) {
      saveFileContent(selectedNode.key, fileContent);
    }
  };

  // 键盘快捷键保存 (Ctrl+S 或 Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode?.key, hasUnsavedChanges, fileContent]);

  // workflow
  const [nodes, setNodes] = useState<Node[]>(initialNode);
  const [edges, setEdges] = useState<Edge[]>(initialEdge);

  useEffect(() => {
    if (selectedNode?.key) {
      getWorkflow(selectedNode.key).then((response) => {
        setNodes(response.message.nodes.length > 0 ? response.message.nodes : initialNode);
        setEdges(response.message.edges.length > 0 ? response.message.edges : initialEdge);
      });
    }
  }, [selectedNode?.key]);

  const onSaveWorkflow = (nodes: Node[], edges: Edge[]) => {
    if (selectedNode?.key) {
      saveWorkflow(selectedNode.key, nodes, edges).then(()=>{
          Toast.notify({ type: 'success', message: t('保存成功') });
      }).catch(()=>{
        Toast.notify({ type: 'error', message: t('保存失败') });
      });
    }
  };
  return (
    <div className="w-full h-full px-4 relative flex justify-end" ref={contentRef} onClick={handleContainerClick}>
      <div className={`h-full flex-1 ${isSidebarOpen ? "pr-80" : ""}`}>
        {selectedNode ? (
          selectedNode.isLeaf ? (
            isLoading ? (
              <div className="flex items-center justify-center h-full text-text-primary">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-border-dark"></div>
                  <span>正在加载文件内容...</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-2 bg-transparent">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-primary">
                      {fileInfo?.name || selectedNode.name || selectedNode.title}
                    </span>
                    {fileInfo && (
                      <span className="text-xs text-text-primary">
                        {fileInfo.mime_type} • {(fileInfo.size / 1024).toFixed(2)} KB
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                      <Button
                        onClick={handleSaveFile}
                        className="px-3 py-1"
                      >
                        {t('operate.save')}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <EditorComponent
                    content={fileContent}
                    onContentChange={handleContentChange}
                    onTextSelection={handleEditorTextSelection}
                  />
                </div>
              </div>
            )
          ) : (
            <div className="h-full ">
              <Workflow
                initialNodes={nodes}
                initialEdges={edges}
                onSave={onSaveWorkflow}
              />
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full text-text-primary">
            {t("common.editor.tip")}
          </div>
        )}
      </div>

      {/* 悬浮按钮 */}
      <FloatingButton
        onClick={handleOpenSidebar}
        isVisible={!isSidebarOpen}
      />

      {/* LLM侧边栏 */}
      <LLMSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        initialText={initialText}
      />

      {/* 文本选择气泡 */}
      <TextSelectionBubble
        selectedText={selectedText}
        position={bubblePosition}
        onAISearch={handleAISearch}
        onClose={handleCloseBubble}
      />
    </div>
  )
}
export default ContentRight