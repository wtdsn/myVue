/* 
    生命周期相关
*/
import { Watcher } from '../observer/watcher'

// 暂不考虑 ， 用于执行生命周期函数回调
export function callHook() { }


// 生命周期状态数据
export function initLifecycle(vm) {
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

export function lifecycleMixin(MyVue) {
  /* 
   使用 diff 算法 ，使用新 VDOM 更新 旧 VDOM ，刷新页面
  */
  MyVue.prototype._update = function (vnode) {
    let vm = this
    const preEl = vm.$el
    const prevNode = vm._vnode
    vm._vnode = vnode
    if (!prevNode) {
      // 第一次
      vm.$el = vm.__patch__(preEl, vnode)
    } else {
      // 更新
      vm.$el = vm.__patch__(prevNode, vnode)
    }
  }

  // 强制更新
  MyVue.prototype.$forceUpdate = function () {
    const vm = this
    if (vm._watcher) {
      vm._watcher.update()
    }
  }
}

// 组件/页面 挂载 
export function mountComponent(vm, el) {
  vm.$el = el

  // 为该 vm 创建 watch
  let updateComponent = () => {
    // _render 方法将执行 render 函数  和数据生成 VDOM
    // _update 对比新老 VDOM ，进行页面更新
    vm._update(vm._render())
  }

  // 为该 vm 创建 watcher 
  // 创建一个 watch . 传入渲染函数X
  new Watcher(this, updateComponent)

  return vm
}

