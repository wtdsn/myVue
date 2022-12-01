import { toString } from '../../../shared/index.js'
import { createTextVNode, createEmptyVNode } from '../../../vdom/vdom'

export function installRenderHelpers(target) {
  target._s = toString
  target._l = renderList

  target._m = renderStatic
  target._k = checkKeyCodes


  target._v = createTextVNode
  target._e = createEmptyVNode

  // target._b = bindObjectProps
  // target._g = bindObjectListeners
  // target._d = bindDynamicKeys
}


// keyCode 的判断
function checkKeyCodes(eventKeyCode, key, builtInKeyCode, eventKeyName, builtInKeyName) {
  // 暂且不考虑
  return false
}

// 渲染列表 , val 为循环的对象 ， rende 是封装的渲染函数。需要参数是当前元素和下标
function renderList(val, render) {
  // debugger
  let res = []
  for (let i = 0, l = val.length; i < l; i++) {
    res.push(render(val[i], i))
  }
  return res
}

function renderStatic(index) {
  let tree
  try {
    tree = (this.$options.staticRenderFns[index]).call(
      this._renderProxy,
      this._c,
      this // for render fns generated for functional component templates
    )
    return tree
  } catch (eer) {
    console.log("Err", eer, index);
  }
}