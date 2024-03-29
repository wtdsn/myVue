import { observer } from '../observer/index'
import { Watcher } from '../observer/watcher'
import { Dep } from '../observer/dep'
import { proxy } from '../../shared'

// 状态初始化
export function initState(vm) {
  const opts = vm.$options

  // 方法
  if (opts.methods) initMethods(vm, opts.methods)

  // data
  if (opts.data) initData(vm)

  // computed 初始化
  if (opts.computed) initComputed(vm, opts.computed)

  // watch
  if (opts.watch) {
    initWatch(vm, opts.watch)
  }


}

// 添加 $watch ， 在 vue 中这里还有 $get $set 等的方法
export function stateMixin(MyVue) {

  // 挂载 $watch 方法
  MyVue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {

    // 如果参数位置不对
    if (typeof cb === 'object') {
      return createWatcher(vm, expOrFn, cb, options)
    }

    const vm = this
    options = options || {}

    // 为该数据创建 watch ， expOrFn 为字符串
    // 在创建 watcher 后 ，执行的 get 会读取 expOrFn 对应的数据，收集当前的 watcher
    // 在之后该数据更新时 ，通知 watcher 更新，watcher 会保留旧值 ，更新获取新值，调用 cb ，即 watch 的回调, 传入新旧值
    const watcher = new Watcher(vm, expOrFn, options, cb)

    // 如果是立即执行 , 先执行一次 cb , 仅有当前值
    if (options.immediate) {
      cb.call(vm, watcher.value)
    }

    // 返回的函数，是取消监听 ，暂不考虑
    // return function unwatchFn() {
    //   watcher.teardown()
    // }
  }
}


// 初始化 data
function initData(vm) {
  observer(vm._data)

  Object.keys(vm._data).forEach(key => {
    proxy(vm, '_data', key)
  })
}

// methods
function initMethods(vm, methods) {
  Object.keys(methods).forEach((key) => {
    vm[key] = methods[key].bind(vm)
  })
}

// computed
function initComputed(vm, computed) {
  // 在 vm 中添加 _computedWatchers 属性 ， 记录 computed 的 watcher
  const watchers = (vm._computedWatchers = {})

  // 对每个 computed 进行处理
  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get

    // 为该 computed 创建 watcher
    // getter 即该 computed 更新时执行的函数
    // lazy 表示惰性求值 ，依赖不更新，不求值，达到计算值缓存效果
    watchers[key] = new Watcher(
      vm,
      getter,
      { lazy: true }
    )

    // 将此计算属性挂载到 vm 中 ， 并设置拦截
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    }
  }
}

// 将计算属性挂载到 vm 中 ， 并设置拦截 , 暂不考虑 不缓存 的情况
function defineComputed(vm, key, userDef) {
  const sharedPropertyDefinition = {
    configurable: true,
    enumerable: true,
  }

  // 使用封装 getter
  sharedPropertyDefinition.get = createComputedGetter(key)

  if (userDef.set)
    sharedPropertyDefinition.set = userDef.set

  Object.defineProperty(vm, key, sharedPropertyDefinition)
}

// 对 computed 的 getter 进行封装 。使得可以缓存
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      // 第一次调用 ，数据默认是脏的 ，会调用computed
      // computed 读取其他数据，其他数据的 getter 触发 ，收集此 watcher , 之后更新就可以更新 computed
      // 如果数据脏了 ，即 computed 的依赖数据更新了，则需要重新计算
      if (watcher.dirty) {
        watcher.evaluate()
      }

      // 收集页页面 or 组件的 watcher
      // 这是因为 computed 里依赖的数据页面k可能没有使用
      // 也就是 computed 的依赖数据更新了 ，通过了 computed 更新
      // 但页面并不知道 computed 更新 
      // 因此这里是通知 watcher 对应的全部 Dep 收集页面的 watcher , 从而这些数据更新的时候
      // 即通知 computed 的 watche 更新 computed , 同时也通知页面的 computed 更新页面
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}

// watch
function initWatch(vm, watch) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

// 内部调用 $watch 
function createWatcher(
  vm,
  expOrFn,  // string 仅考虑直接属性不考虑对象内部属性
  handler,
  options
) {
  if (typeof handler === 'object') {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    // 如果是字符串 ，即可能是 vm 中的 method
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}