import { isUnDef } from "../../shared";
// 暂时不考虑 addEventListener 第三参数
let target
// 更新 DOM 事件的方法
function updateDOMListeners(oldVnode,vnode) {
  // both has not event
  if (isUnDef(oldVnode.data.on) && isUnDef(vnode.data.on)) {
    return
  }

  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}

  target = vnode.elm || oldVnode.elm
  // normalizeEvents(on) 考虑一个事件多个回调。这里不考虑 ，比如 click 就一个处理函数
  updateListeners(on, oldOn)
  target = undefined
}

function add(name, handler) {
  target.addEventListener(
    name,
    handler
  )
}

function remove(
  name,
  handler,
  _target
) {
  (_target || target).removeEventListener(
    name,
    handler
  )
}

// 实际上的更新方法，操作在 elm 上
function updateListeners(on, oldOn) {
  let name

  // 删除之前的
  for (name in oldOn) {
    remove(name, oldOn[name])
  }

  // 增加当前的
  for (name in on) {
    add(name, on[name])
  }
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners,
}