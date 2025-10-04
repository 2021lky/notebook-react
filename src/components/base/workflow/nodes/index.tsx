import { memo } from 'react'
import { NodeComponentMap } from './contents'
import type { NodeProps } from 'reactflow'
import BaseNode from "./_base/node"

const CustomNode = (props: NodeProps) => {
  const nodeData = props.data
  const NodeComponent = NodeComponentMap[nodeData.type]

  return (
    <BaseNode {...props}>
        <NodeComponent />
    </BaseNode>
  )
}
CustomNode.displayName = 'CustomNode'

export default memo(CustomNode)
