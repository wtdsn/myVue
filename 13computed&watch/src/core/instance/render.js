import { createElement } from '../../vdom/createElement'
import { installRenderHelpers } from './render-helps/render-helpers'
import { nextTick } from '../util'

// 在 vm 中挂载 _c 方法 ， 即创建 Vnode 的方法
export function initRender(vm) {
  // const options = vm.$options
  // const parentVnode = (vm.$vnode = options._parentVnode) // the placeholder node in parent tree
  // const parentData = parentVnode && parentVnode.data

  // 标签名 ， 属性 ，子孩子 ， d 暂时不管
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)     // vue 自定义的创建元素的方法
}

// 在 Vue 的原型链上挂载各种创建 vnode 的方法 ，比如 _l _s _v 等
export function renderMixin(MyVue) {
  installRenderHelpers(MyVue.prototype)

  // 挂载 $nextTick 方法
  MyVue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  }

  // 挂载 _render 方法 ，创建 vnode ， 内部调用的是 render 函数
  MyVue.prototype._render = function () {
    const vm = this
    const { render } = vm.$options
    return render.call(vm._renderProxy)
  }
}