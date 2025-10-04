import type { NodeDefault } from '../../types'
import type { ImageNodeType } from "./types"
import { BlockEnum } from '../../types'


const nodeDefault: NodeDefault<ImageNodeType> = {
  defaultValue: {},
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
