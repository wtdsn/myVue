import { isDef, isArray, isUnDef } from "../../../shared";

function updateClass(oldVnode, vnode) {
  const el = vnode.elm
  const data = vnode.data || {}
  const oldData = oldVnode.data || {}

  // 都没有 ，无效更改
  if (
    isUnDef(data.staticClass) &&
    isUnDef(data.class) &&
    isUnDef(oldData.staticClass) &&
    isUnDef(oldData.class)
  ) {
    return
  }

  let cls = data ? genClassForVnode(data) : ''
  el.setAttribute('class', cls)
}

/* 
   处理 static 和 动态的类目
*/
function genClassForVnode(data) {
  let classString = data.staticClass ? (data.staticClass + ' ') : ''
  let klass = data.class

  if (isDef(klass)) {
    // array type
    if (isArray(klass)) {
      classString += ' ' + klass.reducer((p, v) => {
        return p + ' ' + v
      })
    } else
      // object
      if (typeof klass === 'object') {
        for (const key in klass) {
          if (ownHas(klass, key) && klass[key]) {
            classString += `${key} `
          }
        }
      }
  }

  return classString
}

export default {
  create: updateClass,
  update: updateClass
}
