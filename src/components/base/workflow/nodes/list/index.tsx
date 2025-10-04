import { ListNodeType } from "./types"
import { useReactFlow } from 'reactflow';
import { RiDeleteBinLine, RiAlignJustify } from '@remixicon/react'
import Input from '@/components/base/Input'
import { useState, useRef, useCallback } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Button from '@/components/base/Button'
import { v4 as uuidv4 } from 'uuid';
import { useDebounceFn } from 'ahooks';

const ITEM_TYPE = 'ListItem'

type ListItem = { id: string; value: string }

function ListNode({ id, data }: { id: string, data: ListNodeType }) {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false)

  const [value, setValue] = useState<ListItem[]>(
    (data.list || []).map(item => ({ id: item.id, value: item.value }))
  );

  const updateNodes = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, list: value.filter(it => it.value.trim()) } }
          : node
      )
    );
  }, [id, setNodes, value])

  // 移动列表项（核心排序逻辑）
  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setValue(prev => {
      const newList = [...prev];
      // 从原位置移除
      const [movedItem] = newList.splice(dragIndex, 1);
      // 插入新位置
      newList.splice(hoverIndex, 0, movedItem);
      return newList;
    });
    setIsEditing(true)

  }, []);

  const DraggableRow = useCallback(({ item, index }: { item: ListItem; index: number; }) => {
    const rowRef = useRef<HTMLDivElement>(null)
    const [textValue, setTextValue] = useState(item.value)
    // 放置逻辑
    const [, drop] = useDrop<{ index: number; id: string }>({
      accept: ITEM_TYPE,
      hover(dragItem) {
        // 安全校验：DOM不存在或拖拽自身时不处理
        if (!rowRef.current || dragItem.id === item.id) return;

        // 获取当前拖拽项和放置目标的索引
        const dragIndex = dragItem.index;
        const hoverIndex = index;
        moveItem(dragIndex, hoverIndex)
        // 同步更新拖拽项的索引（关键：避免排序错乱）
        dragItem.index = hoverIndex;
      },
      drop() {
        // updateNodes()
      },
    })

    // 拖拽源逻辑（被拖拽项）
    const [{ isDragging }, drag] = useDrag({
      type: ITEM_TYPE,
      // 仅传递必要数据：当前项索引和唯一ID
      item: { index, id: item.id },
      // 收集拖拽状态（用于样式反馈）
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      // 拖拽结束后强制更新（兜底）
      end: () => {
        // updateNodes();
      },
    });

    // 将拖拽/放置逻辑绑定到DOM
    drag(drop(rowRef));
    const changeItemValue = () => {
      setValue(prev => prev.map((it, i) =>
        i === index ? { ...it, value: textValue } : it
      ));
    }
    const { run: debouncedUpdate } = useDebounceFn(changeItemValue, {
      wait: 300, // 延迟时间，可按需调整
    });
    return (
      <div
        ref={rowRef}
        className="flex items-center nodrag rounded"
        style={{
          opacity: isDragging ? 0.5 : 1,
          backgroundColor: isDragging ? '#f0f0f0' : 'transparent',
          transition: 'opacity 0.2s, background-color 0.2s',
        }}
      >
        {/* 拖拽把手（仅此处可触发拖拽） */}
        <div
          className="w-4 h-4 mr-1 flex items-center justify-center text-text-secondary cursor-move"
        >
          <RiAlignJustify className="w-3 h-3" />
        </div>

        <Input
          className="flex-1 nodrag !py-1 "
          value={textValue}
          onChange={(e) => {
            setIsEditing(true)
            setTextValue(e.target.value);
            debouncedUpdate();
          }}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />

        <RiDeleteBinLine
          className="w-4 h-4 ml-1 text-text-secondary cursor-pointer hover:text-red-500"
          onClick={() => {
            setIsEditing(true)
            setValue(prev => prev.filter((_, i) => i !== index));
            // updateNodes();
          }}
        />
      </div>
    );
  }, [value])

  return (
    <div className="flex flex-col space-y-2 p-2">
      <div className="flex items-center space-x-2 justify-end">
        <Button
          onClick={() => {
            setIsEditing(true)
            setValue(prev => [...prev, { id: uuidv4(), value: '' }]);
          }}
          variant="secondary"
          size="small"
        >
          添加项
        </Button>

        <Button
          onClick={() => {
            setIsEditing(false)
            updateNodes()
          }}
          size="small"
          disabled={!isEditing}
        >
          保存
        </Button>
      </div>

      {/* 拖拽上下文（确保只渲染一次） */}
      <DndProvider backend={HTML5Backend}>
        <div
          className="nodrag nopan flex flex-col space-y-1"
        >
          {value.map((item, index) => (
            <DraggableRow
              key={item.id}
              item={item}
              index={index}
            />
          ))}
        </div>
      </DndProvider>
    </div>
  );
}

export default ListNode;
