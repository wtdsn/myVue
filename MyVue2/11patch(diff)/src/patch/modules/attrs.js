import { isUnDef } from "../../shared";

// 更新 attr
function updateAttrs(oldVnode, vnode) {
  // 如果都没有
  if (isUnDef(oldVnode.data.attrs) && isUnDef(vnode.data.attrs)) {
    return
  }

  let key, cur, old
  const elm = vnode.elm

  const oldAttrs = oldVnode.data.attrs || {}
  let attrs = vnode.data.attrs || {}

  // 将新的 ，并且与旧的不同的 ，更新到 elm 中
  for (key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    if (old !== cur) {
      setAttr(elm, key, cur)
    }
  }

  // 将旧的 ，并且新没有的 ，删除
  for (key in oldAttrs) {
    if (isUnDef(attrs[key])) {
      elm.removeAttribute(key)
    }
  }
}


function setAttr(el, key, value) {
  if (value === false || value === undefined || value === null) {
    el.removeAttribute(key)
  }
  el.setAttribute(key, value)
}

export default {
  create: updateAttrs,
  update: updateAttrs
}