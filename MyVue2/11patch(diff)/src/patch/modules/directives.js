import { isUnDef } from "../../shared"

function updateDirectives(oldVnode, vnode) {


  // 都没有 ，无需更改
  if (
    isUnDef(vnode.data.directives) &&
    isUnDef(oldVnode.data.directives)
  ) {
    return
  }

  const el = vnode.elm
  let oldDir = oldVnode.data.directives || {}, dir = vnode.data.directives || {}

  if (oldDir.model === dir.model) return

  if (oldDir.modleFns) {
    el.removeEventListener('input', oldDir.modleFns)
  }

  if (dir.model) {
    if (dir.model) {
      el.value = vnode.context[dir.model]
    }

    function modleFns($events) {
      this[dir.model] = $events.target.value
    }

    dir.modleFns = modleFns.bind(vnode.context)
    el.addEventListener('input', dir.modleFns)
  }
}


export default {
  create: updateDirectives,
  update: updateDirectives
}
