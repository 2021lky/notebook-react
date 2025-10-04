import type { NodeDefault } from '../../types'
import type { StartNodeType } from "./types"
import { BlockEnum } from '../../types'


const nodeDefault: NodeDefault<StartNodeType> = {
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
