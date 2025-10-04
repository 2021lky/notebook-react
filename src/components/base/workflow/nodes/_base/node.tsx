import type {
  FC,
  ReactElement,
} from 'react'
import {
  useEffect,
  useState
} from 'react'
import {
  memo,
  cloneElement
} from 'react'
import type { NodeProps } from '../../types'

import {
  NodeSourceHandle,
  NodeTargetHandle,
} from "./components/node-handle"
import cn from '@/utils/classnames'
import { Resizable } from 're-resizable'
import { useReactFlow } from 'reactflow'
import Input from '@/components/base/Input'

type BaseNodeProps = {
  children: ReactElement
} & NodeProps

const BaseNode: FC<BaseNodeProps> = ({
  id,
  data,
  children,
}) => {
  const [showSelectedBorder, setShowSelectedBorder] = useState(false);
  useEffect(() => {
    setShowSelectedBorder(Boolean(data?.selected));
  }, [data?.selected]);
  const { setNodes } = useReactFlow()
  const [nodeData, setNodeData] = useState(data)
  const [titleEdit, setTitleEdit] = useState(false)
  useEffect(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...nodeData } }
          : node
      )
    )
  }, [nodeData]);
  return (
    <Resizable
      // 关键：在 Resizable 的句柄上打上 nodrag，避免触发 ReactFlow 节点拖拽
      handleClasses={{
        top: 'nodrag',
        right: 'nodrag',
        bottom: 'nodrag',
        left: 'nodrag',
        topRight: 'nodrag',
        bottomRight: 'nodrag',
        bottomLeft: 'nodrag',
        topLeft: 'nodrag',
      }}
      className={cn(
        'relative flex flex-col justify-center rounded-xl border-[1px] bg-white',
        showSelectedBorder ? 'border-primary border-[2px]' : 'border-text-primary',
      )}
      size={{ width: data.width, height: data.height }}
      minWidth={120}
      minHeight={80}
      enable={{
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
      style={{
        width: `${data.width}px`,
        height: `${data.height}px`
      }}
      onResize={(e) => e.stopPropagation()}
      onResizeStop={(e, _, ref) => {
        e.stopPropagation()
        const nextW = (ref as HTMLDivElement).offsetWidth
        const nextH = (ref as HTMLDivElement).offsetHeight
        setNodes((nodes) =>
          nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, width: nextW, height: nextH } }
              : node
          )
        )
        setNodeData({ ...data, width: nextW, height: nextH })
      }}
    >
      <NodeTargetHandle
        id={id}
        data={nodeData}
        handleClassName='!top-4 !-left-[4px] !translate-y-0'
        handleId='target'
      />

      <NodeSourceHandle
        id={id}
        data={nodeData}
        handleClassName='!top-4 !-right-[4px] !translate-y-0'
        handleId='source'
      />


      <div
        className='px-3 pt-2 h-[32px] sticky text-sm font-bold text-text-primary truncate'
        onClick={() => setTitleEdit(true)}
        title={data.title || ''}
      >
        {titleEdit ? (
          <Input
            type='text'
            value={data.title || ''} // 确保值不为undefined
            onChange={(e) => {
              const value = e.target.value.trim();
              // 只有当值不为空时才更新，或者保留最后一个有效值
              if (value || data.title) {
                setNodeData({ ...nodeData, title: value });
              }
            }}
            onMouseLeave={() => {
              // 失去焦点时验证，如果为空则恢复之前的有效值
              const trimmedTitle = (data.title || '').trim();
              if (!trimmedTitle) {
                setNodeData({ ...nodeData, title: nodeData.title || '无标题' });
              }
              setTitleEdit(false);
            }}
            className='!h-[24px] !py-0 text-sm font-bold text-text-primary whitespace-pre-line break-words'
          />
        ) : (
          // 显示时如果为空，展示默认文本
          (data.title || '无标题').trim()
        )}
      </div>


      {/* {
        data.desc && (
          <div className='px-3 pb-2 text-xs text-text-primary-200 whitespace-pre-line break-words'>
            {data.desc}
          </div>
        )
      } */}
      <div className='grow pb-1 pl-1 pr-1 flex-1'>
        {cloneElement(children, { id, data })}
      </div>
    </Resizable>
  )
}

export default memo(BaseNode)
