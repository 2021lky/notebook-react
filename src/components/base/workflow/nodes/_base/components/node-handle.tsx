import {
  memo,
} from 'react'
import {
  Handle,
  Position,
} from 'reactflow'
import type { Node } from '../../../types'
import cn from '@/utils/classnames'

type NodeHandleProps = {
  handleId: string
  handleClassName?: string
} & Pick<Node, 'id' | 'data'>

export const NodeTargetHandle = memo(({
  id,
  data,
  handleId,
  handleClassName,
}: NodeHandleProps) => {
  const isSelected = data?.selected;
  
  return (
    <>
      <Handle
        id={handleId}
        type='target'
        position={Position.Left}
        className={cn(
          'z-[1] !h-2 !w-2 !rounded-full !border !outline-none transition-all', // 基础样式
          isSelected 
            ? '!border-primary !bg-primary' // 选中状态
            : '!border-gray-400 !bg-gray-300 hover:!bg-primary hover:!border-primary', // 默认状态
          handleClassName,
        )}
      />
    </>
  )
})
NodeTargetHandle.displayName = 'NodeTargetHandle'

export const NodeSourceHandle = memo(({
  id,
  data,
  handleId,
  handleClassName,
}: NodeHandleProps) => {
  const isSelected = data.selected;

  return (
    <Handle
      id={handleId}
      type='source'
      position={Position.Right}
      className={cn(
        'z-[1] !h-2 !w-2 !rounded-full !border !outline-none transition-all', // 基础样式
        isSelected 
          ? '!border-primary !bg-primary' // 选中状态
          : '!border-gray-400 !bg-gray-300 hover:!bg-primary hover:!border-primary', // 默认状态
        handleClassName,
      )}
    />
  )
})
NodeSourceHandle.displayName = 'NodeSourceHandle'
