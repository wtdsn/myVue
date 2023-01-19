import { initState } from './state'
import { initLifecycle } from './lifecycle'
import { initRender } from './render'

let uid = 1
export function initMixin(MyVue) {
  MyVue.prototype._init = function (options) {
    const vm = this

    vm._uid = uid++
    vm._self = vm

    vm.$options = options
    vm._data = options.data
    vm._methods = options.methods

    vm._renderProxy = vm

    //  初始化生命周期的一些状态变量
    initLifecycle(vm)

    // 挂载创建 vnode 的方法
    initRender(vm)

    // 此处可调用 beforeCreate 回调
    // callHook(vm,'beforeCreate')

    // 状态初始化 ，比如 data , methdos, computed ,props, watch
    initState(vm)

    //此处可调用 created 回调
    // callHook(vm,'created')

    // 传入 el 开始处理处理模板等任务
    this.$mount(vm.$options.el)
  }
}