import type { ComponentType } from 'react'
import { BlockEnum } from '../types'
import StartNode from './start'
import EndNode from './end'
import TextNode from './text'
import ListNode from './list'
import ImageNode from './image'
import TitleNode from './title'

export const NodeComponentMap: Record<string, ComponentType<any>> = {
  [BlockEnum.Start]: StartNode,
  [BlockEnum.End]: EndNode,
  [BlockEnum.Text]: TextNode,
  [BlockEnum.List]: ListNode,
  [BlockEnum.Image]: ImageNode,
  [BlockEnum.Title]: TitleNode,
}

