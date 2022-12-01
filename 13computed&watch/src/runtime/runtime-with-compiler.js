// 对 runtime/index 的 MyVue 再处理并导出

import MyVue from "./index";
import { createCompiler } from '../compiler/index'

// 取出原本的 $mounte 方法 ， 原本的 mount 方法 。会执行 mountComponent 方法。是调用该组件的 render
const mount = MyVue.prototype.$mount

// 覆盖 $mount 方法 ，新的方法挂载再 options 中挂载 render 函数 ，再执行原本的方法
MyVue.prototype.$mount = function (el) {
  const options = this.$options
  this.$el = document.querySelector(el)
  this.$parent = this.$el.parentNode

  // 如果没有 render 函数
  if (!options.render) {
    let template = this.$el.outerHTML
    const { render, staticRenderFns } = createCompiler(template, options)
    options.render = render
    options.staticRenderFns = staticRenderFns
  }

  // 挂载
  mount.call(this, this.$el)
}

export default MyVue