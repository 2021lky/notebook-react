import { BlockEnum } from './types';
// 1. 定义所有节点的默认数据
export const CUSTOM_NODE = 'custom'
export const CUSTOM_EDGE = 'custom'


// 初始节点数据
export const initialNode = [
  {
    id: '1',
    type: CUSTOM_NODE,
    position: { x: 100, y: 100 },
    data: { title: '标题节点', type: BlockEnum.Title }
  },
  {
    id: '2',
    type: CUSTOM_NODE,
    position: { x: 500, y: 100 },
    data: { title: '文本节点', type: BlockEnum.Text}
  }
];

export const initialEdge = [{ id: 'e1-2', source: '1', target: '2', type: CUSTOM_EDGE, data: { sourceType: BlockEnum.Title, targetType: BlockEnum.Text, label: '默认边' } }];
