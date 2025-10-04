import type { NodeDefault } from '../../types'
import type { EndNodeType } from "./types"
import { BlockEnum } from '../../types'

const nodeDefault: NodeDefault<EndNodeType> = {
  defaultValue: {},
  getAvailablePrevNodes() {
    return [BlockEnum.Start]
  },
  getAvailableNextNodes() {
    return []
  },
  checkValid() {
    return {
      isValid: true,
    }
  },
}

export default nodeDefault
