import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
  XYPosition,
} from 'reactflow'

export enum BlockEnum {
  Start = 'start',
  End = 'end',
  Text = 'text',
  List = 'list',
  Image = 'image',
  Title = 'title',
}

// 扩展了 React Flow 基础节点属性的自定义类型
export type CommonNodeType<T = {}> = {
  // 节点连接关系
  _connectedSourceHandleIds?: string[]  // 连接的源节点的handle id
  _connectedTargetHandleIds?: string[]  // 连接的目标节点的handle id
  _isCandidate?: boolean  // 是否为候选节点，新建后并没有放置在画布中
  _hovering?: boolean  // 标识节点是否处于鼠标悬停状态

  // 节点业务信息
  title: string // 节点标题
  desc?: string  // 节点描述
  type: BlockEnum  // 节点类型
  width?: number  // 节点宽度
  height?: number  // 节点高度
  position?: XYPosition  // 节点位置
  selected?: boolean  // 节点是否选中

  // 文本节点专属
  text?: string 
  // 列表节点专属
  list?: {
    id: string
    value: string
  }[]
  // 图片节点专属
  image?: {
    url: string
  }
} & T

export type CommonEdgeType = {
  _hovering?: boolean  // 标识边是否处于鼠标悬停状态
  sourceType?: BlockEnum  // 源节点（起点）的类型
  targetType?: BlockEnum  // 目标节点（终点）的类型
  selected?: boolean  // 标识边是否正在编辑中
  label?: string  // 边的文本标签
}

// 自定义ReactFlow节点类型
export type Node<T = {}> = ReactFlowNode<CommonNodeType<T>>
export type NodeProps<T = unknown> = { id: string; data: CommonNodeType<T> }
export type OnSelectBlock = (type: BlockEnum) => void

export type Edge = ReactFlowEdge<CommonEdgeType>

// 节点默认信息
export type NodeDefault<T> = {
  defaultValue: Partial<T>
  getAvailablePrevNodes: (isChatMode: boolean) => BlockEnum[]
  getAvailableNextNodes: (isChatMode: boolean) => BlockEnum[]
  checkValid: (payload: T, t: any, moreDataForCheckValid?: any) => { isValid: boolean; errorMessage?: string }
}