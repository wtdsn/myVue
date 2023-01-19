import * as nodeOps from './node-ops'
import { createPatchFunction } from './patch'
import modules from './modules/index'

export const patch = createPatchFunction({
  nodeOps, modules
})