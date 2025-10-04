import type { NodeDefault } from '../../types'
import type { TitleNodeType } from "./types"
import { BlockEnum } from '../../types'


const nodeDefault: NodeDefault<TitleNodeType> = {
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
