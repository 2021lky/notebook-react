import type { NodeDefault } from '../../types'
import type { ListNodeType } from "./types"
import { BlockEnum } from '../../types'


const nodeDefault: NodeDefault<ListNodeType> = {
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
