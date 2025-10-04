import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  OnNodesDelete,
  ReactFlowInstance,
  Connection,
  EdgeMouseHandler,
  NodeMouseHandler,
} from 'reactflow';
import CustomNode from './nodes';
import { CUSTOM_NODE, CUSTOM_EDGE } from './contents';
import { BlockEnum, Node, Edge } from './types';
import CustomEdge from './custom-edge'
import 'reactflow/dist/style.css';
import Button from '@/components/base/Button'

const nodeTypes = {
  [CUSTOM_NODE]: CustomNode,
}
const edgeTypes = {
  [CUSTOM_EDGE]: CustomEdge,
}

export type WorkflowProps = {
  initialNodes: Node[];
  initialEdges: Edge[];
  onSave: (nodes: Node[], edges: Edge[]) => void;
}
const Workflow = ({
  initialNodes,
  initialEdges,
  onSave,
}: WorkflowProps) => {
  // 使用状态管理节点和边
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 同步父组件传入的最新值
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetId: string;
    targetType: 'node' | 'edge';
  } | null>(null);

  // 连接处理函数（修正类型）
  // 辅助：根据节点 id 获取其类型
  const getNodeTypeById = useCallback((id: string | null | undefined) => {
    if (!id) return undefined;
    return nodes.find((n) => n.id === id)?.data.type;
  }, [nodes]);

  // 连接处理：补齐边的必填类型字段
  const onConnect = useCallback((params: Connection) => {
    const sourceType = getNodeTypeById(params.source) ?? BlockEnum.Text;
    const targetType = getNodeTypeById(params.target) ?? BlockEnum.Text;
    setEdges((eds) =>
      addEdge(
        { ...params, type: CUSTOM_EDGE, data: { label: '默认边', sourceType, targetType } },
        eds,
      ),
    );
  }, [setEdges, getNodeTypeById]);

  // 拖拽放置处理（修正类型 & 新建节点数据结构）
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!reactFlowInstance || !reactFlowWrapper.current) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    const blockEnumType = event.dataTransfer.getData('application/blockenumtype');
    const label = event.dataTransfer.getData('application/label');

    if (typeof type === 'undefined' || !type || typeof blockEnumType === 'undefined' || !blockEnumType) return;

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: `${Date.now()}`,
      type, // 应为 CUSTOM_NODE
      position,
      data: {
        title: label || '新节点',
        type: blockEnumType as BlockEnum,
        desc: '拖拽创建的节点',
      },
    };

    // 关键：强制与当前 nodes 元素类型对齐，消除 concat 重载报错
    setNodes((nds) => nds.concat(newNode as typeof nds[number]));
  }, [reactFlowInstance, setNodes]);

  // 拖拽覆盖处理（修正类型）
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 删除节点（修正签名为 Node[]）
  const onDeleteNode: OnNodesDelete = useCallback((deletedNodes) => {
    setNodes((nds) => nds.filter((node) => !deletedNodes.some((deletedNode) => deletedNode.id === node.id)));
    setEdges((eds) => eds.filter((edge) => !deletedNodes.some((node) => node.id === edge.source || node.id === edge.target)));
  }, [setNodes, setEdges]);

  // 右键点击节点事件（修正类型）
  const onNodeContextMenu = useCallback<NodeMouseHandler>((event, node) => {
    event.preventDefault();
    if (reactFlowWrapper.current) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      setContextMenu({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
        targetId: node.id,
        targetType: 'node',
      });
    }
  }, []);

  // 删除指定节点（修正调用签名）
  const handleDeleteNode = useCallback(() => {
    if (contextMenu && contextMenu.targetType === 'node') {
      const nodeToDelete = nodes.find((node) => node.id === contextMenu.targetId);
      if (nodeToDelete) {
        onDeleteNode([nodeToDelete]);
      }
      setContextMenu(null);
    }
  }, [contextMenu, onDeleteNode, nodes]);

  // 右键点击边事件（修正类型）
  const onEdgeContextMenu = useCallback<EdgeMouseHandler>((event, edge) => {
    event.preventDefault();
    if (reactFlowWrapper.current) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      setContextMenu({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
        targetId: edge.id,
        targetType: 'edge',
      });
    }
  }, []);

  // 删除指定边（修正调用签名）
  const handleDeleteEdge = useCallback(() => {
    if (contextMenu && contextMenu.targetType === 'edge') {
      setEdges((eds) => eds.filter((e) => e.id !== contextMenu.targetId));
      setContextMenu(null);
    }
  }, [contextMenu, setEdges]);

  // handleEditEdge
  const handleEditEdge = useCallback(() => {
    if (contextMenu && contextMenu.targetType === 'edge') {
      setEdges((eds: Edge[]) =>
        eds.map((e) => ({
          ...e,
          data: {
            // 保证必填字段存在，即使原始 e.data 为 undefined
            ...(e.data || { sourceType: BlockEnum.Text, targetType: BlockEnum.Text }),
            selected: e.id === contextMenu.targetId,
            label: e.data?.label ?? '默认边',
          },
        })),
      );
      setContextMenu(null);
    }
  }, [contextMenu, setEdges]);

  // 边悬停：进入时置为激活（新增事件 + 类型）
  // handleEdgeMouseEnter
  const handleEdgeMouseEnter = useCallback<EdgeMouseHandler>((_, edge) => {
    setEdges((eds: Edge[]) =>
      eds.map((e) =>
        e.id === edge.id
          ? {
              ...e,
              data: {
                ...(e.data || { sourceType: BlockEnum.Text, targetType: BlockEnum.Text }),
                label: e.data?.label ?? '',
                _hovering: true,
              },
            }
          : e,
      ),
    );
  }, [setEdges]);

  // 边悬停：离开时取消激活（新增事件 + 类型）
  // handleEdgeMouseLeave
  const handleEdgeMouseLeave = useCallback<EdgeMouseHandler>((_, edge) => {
    setEdges((eds: Edge[]) =>
      eds.map((e) =>
        e.id === edge.id
          ? {
              ...e,
              data: {
                ...(e.data || { sourceType: BlockEnum.Text, targetType: BlockEnum.Text }),
                label: e.data?.label ?? '',
                _hovering: false,
              },
            }
          : e,
      ),
    );
  }, [setEdges]);

  const handleNodeMouseEnter = useCallback<NodeMouseHandler>((_, node) => {
    setNodes((nds) => nds.map((n) => ({
      ...n,
      data: {
        ...n.data,
        selected: n.id === node.id,
      }
    })));
  }, [setNodes]);

  // 节点悬停：离开时取消激活（新增事件 + 类型）
  const handleNodeMouseLeave = useCallback<NodeMouseHandler>(() => {
    setNodes((nds) => nds.map((n) => ({
      ...n,
      data: {
        ...n.data,
        selected: false
      }
    })));
  }, [setNodes]);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  // 拖拽覆盖处理（修正类型）
  const onDragStart = useCallback(
    (
      event: React.DragEvent<HTMLDivElement>,
      type: string,
      blockEnumType: BlockEnum,
      label: string,
    ) => {
      event.dataTransfer.setData('application/reactflow', type);
      event.dataTransfer.setData('application/blockenumtype', blockEnumType);
      event.dataTransfer.setData('application/label', label);
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  // handleEdgeClick
  const handleEdgeClick = useCallback<EdgeMouseHandler>((_, edge) => {
    setEdges((eds: Edge[]) =>
      eds.map((e) => ({
        ...e,
        data: {
          ...(e.data || { sourceType: BlockEnum.Text, targetType: BlockEnum.Text }),
          selected: e.id === edge.id,
          label: e.data?.label ?? '',
        },
      })),
    );
  }, [setEdges]);

  const handleCopyNode = useCallback(() => {
    if (!contextMenu || contextMenu.targetType !== 'node') return;
    const node = nodes.find((n) => n.id === contextMenu.targetId);
    if (!node) return;
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newNode = {
      id: newId,
      type: CUSTOM_NODE,
      position: { x: node.position.x + 30, y: node.position.y + 30 },
      data: { ...node.data },
    };
    setNodes((nds) => nds.concat(newNode as typeof nds[number]));
    setContextMenu(null);
  }, [contextMenu, nodes, setNodes]);

  const handleReplaceNode = useCallback(() => {
    if (!contextMenu || contextMenu.targetType !== 'node') return;
    const node = nodes.find((n) => n.id === contextMenu.targetId);
    if (!node) return;
    const nextType = node.data.type === BlockEnum.Start ? BlockEnum.End : BlockEnum.Start;
    const nextTitle = nextType === BlockEnum.Start ? '开始节点' : '结束节点';
    setNodes((nds) => nds.map((n) => (
      n.id === node.id
        ? { ...n, data: { ...n.data, type: nextType, title: nextTitle } }
        : n
    )));
    setContextMenu(null);
  }, [contextMenu, nodes, setNodes]);

  const handleAddTargetNode = useCallback(() => {
    if (!contextMenu || contextMenu.targetType !== 'node') return;
    const node = nodes.find((n) => n.id === contextMenu.targetId);
    if (!node) return;
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newNode = {
      id: newId,
      type: CUSTOM_NODE,
      position: { x: node.position.x + 200, y: node.position.y },
      data: { title: '普通节点', type: BlockEnum.Start, desc: '添加的目标节点' },
    };
    const newEdge: Edge = {
      id: `e${node.id}-${newId}`,
      source: node.id,
      target: newId,
      type: CUSTOM_EDGE,
      data: { label: '新建边', sourceType: node.data.type, targetType: newNode.data.type },
    };
    setNodes((nds) => nds.concat(newNode as typeof nds[number]));
    setEdges((eds) => eds.concat(newEdge));
    setContextMenu(null);
  }, [contextMenu, nodes, setNodes, setEdges]);

  const handleAddSourceNode = useCallback(() => {
    if (!contextMenu || contextMenu.targetType !== 'node') return;
    const node = nodes.find((n) => n.id === contextMenu.targetId);
    if (!node) return;
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newNode = {
      id: newId,
      type: CUSTOM_NODE,
      position: { x: node.position.x - 200, y: node.position.y },
      data: { title: '普通节点', type: BlockEnum.Start, desc: '添加的源节点' },
    };
    const newEdge: Edge = {
      id: `e${newId}-${node.id}`,
      source: newId,
      target: node.id,
      type: CUSTOM_EDGE,
      data: { label: '新建边', sourceType: newNode.data.type, targetType: node.data.type },
    };
    setNodes((nds) => nds.concat(newNode as typeof nds[number]));
    setEdges((eds) => eds.concat(newEdge));
    setContextMenu(null);
  }, [contextMenu, nodes, setNodes, setEdges]);

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgeMouseEnter={handleEdgeMouseEnter}
        onEdgeMouseLeave={handleEdgeMouseLeave}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        defaultViewport={{ zoom: 1, x: 0, y: 0 }}
        deleteKeyCode="Delete"
        onNodesDelete={onDeleteNode}
        onEdgesDelete={handleDeleteEdge}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onEdgeClick={handleEdgeClick}
        onEdgeContextMenu={onEdgeContextMenu}
      >
        {/* 控制面板 */}
        <Controls />

        {/* 背景 */}
        <Background
          gap={[14, 14]}
          size={2}
          className="bg-[#f2f4f7]"
          color='#8585ad26'
        />

        {/* 侧边栏 - 节点面板 */}
        <Panel position="top-left" className="bg-transparent">
          <Button
            onClick={() => {
              onSave(nodes, edges);
            }}
            size="small"
          >
            保存
          </Button>
        </Panel>

        {/* 侧边栏 - 节点面板 */}
        <Panel position="top-right" className="bg-white p-4 rounded shadow-lg">
          <h3 className="font-bold mb-2">可拖拽节点</h3>
          <div className="space-y-2">
            <div
              className="p-2 border rounded cursor-move bg-blue-50"
              onDragStart={(event) => onDragStart(event, CUSTOM_NODE, BlockEnum.Title, '标题节点')}
              draggable
            >
              标题节点
            </div>
            <div
              className="p-2 border rounded cursor-move bg-red-50"
              onDragStart={(event) => onDragStart(event, CUSTOM_NODE, BlockEnum.Text, '文本节点')}
              draggable
            >
              文本节点
            </div>
            <div
              className="p-2 border rounded cursor-move bg-gray-50"
              onDragStart={(event) => onDragStart(event, CUSTOM_NODE, BlockEnum.List, '列表节点')}
              draggable
            >
              列表节点
            </div>
            <div
              className="p-2 border rounded cursor-move bg-green-50"
              onDragStart={(event) => onDragStart(event, CUSTOM_NODE, BlockEnum.Image, '图片节点')}
              draggable
            >
              图片节点
            </div>
          </div>
        </Panel>

        {/* 自定义右键菜单 */}
        {contextMenu && <div
          style={{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            padding: '8px 0',
          }}
        >
          {contextMenu?.targetType === 'node' ? (
            <>
              <button
                onClick={handleDeleteNode}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                删除节点
              </button>
              <button
                onClick={handleCopyNode}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                复制节点
              </button>
              <button
                onClick={handleReplaceNode}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                更换节点
              </button>
              <button
                onClick={handleAddTargetNode}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                添加目标节点
              </button>
              <button
                onClick={handleAddSourceNode}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                添加源节点
              </button>
            </>) : (
            <>
              <button
                onClick={handleDeleteEdge}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                删除边
              </button>
              <button
                onClick={handleEditEdge}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                编辑边
              </button>
            </>
          )}
        </div>}
      </ReactFlow>
    </div>
  );
}

export default Workflow;