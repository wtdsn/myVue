/* 
    initRener
*/

function initRender(vm) {
  const options = vm.$options
  const parentVnode = (vm.$vnode = options._parentVnode) // the placeholder node in parent tree
  const parentData = parentVnode && parentVnode.data

  // 标签名 ， 属性 ，子孩子 ， d 暂时不管
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)     // vue 自定义的创建元素的方法
}

function renderMinxin(Vue) {
  installRenderHelpers(Vue.prototype)
}