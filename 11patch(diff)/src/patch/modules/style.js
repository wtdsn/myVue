import { isDef, isUnDef, hyphenate } from "../../shared";

function updateStyle(oldVnode, vnode) {
  const data = vnode.data || {}
  const oldData = oldVnode.data || {}
  // 都没有 ，无需更改
  if (
    isUnDef(data.staticStyle) &&
    isUnDef(data.style) &&
    isUnDef(oldData.staticStyle) &&
    isUnDef(oldData.style)
  ) {
    return
  }

  let styles = data ? genStyle(data) : ''
  el.setAttribute('style', styles)
}

/* 
   处理 static 和 动态style
*/
function genStyle(data) {
  let styles = data.staticStyle ? data.staticStyle + ';' : ''
  let style = data.style
  if (isDef(style)) {
    if (typeof style === 'string') {
      styles += style + ';'
    } else if (typeof style === 'object') {
      for (const key in style) {
        styles += `${hyphenate(key)}:${style[key]};`
      }
    }
  }
  return styles
}

export default {
  create: updateStyle,
  update: updateStyle
}
