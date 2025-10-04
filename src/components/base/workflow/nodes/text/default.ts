import type { NodeDefault } from '../../types'
import type { TextNodeType } from "./types"
import { BlockEnum } from '../../types'


const nodeDefault: NodeDefault<TextNodeType> = {
  defaultValue: {
    text: '文本补充',
  },
  getAvailablePrevNodes() {
    return []
  },
  getAvailableNextNodes() {
    const nodes = [BlockEnum.End]
    return nodes
  },
  checkValid() {
    return {
      isValid: true,
    }
  },
}

export default nodeDefault
