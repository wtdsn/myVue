/* 
    Watcher  观察者 . 用于发布更新的行为，也就是触发更新

    也用于 computed watch

    watch 提供4个方法
    set 用于执行函数 ，或计算 。比如在 computed 中使用 。或者是渲染函数
    run 运行 ，内部是调用 get 函数 。 vue 中通过 nextTicket 异步执行
    update 对外公布的方法 。 在属性变化时 ，通过内部更新。内部调用 run 方法
    cleanupDep 清空依赖列表
    addDep 添加 dep

*/
import { makeSet } from '../../shared'
import { pushTarget, popTarget } from './dep'
import { queueWatcher } from './scheduler'

let watcherId = 1

export class Watcher {

  /**
   * Creates an instance of Watcher.
   * @param {any} vm    vue 实例
   * @param {string|function} expOrfn  渲染函数 ，或 watch ，暂时仅考虑函数
   */
  constructor(vm, expOrfn) {
    this.id = watcherId++
    this.vm = vm
    this.getter = expOrfn

    this.deps = [] // 依赖项
    this.depIds = makeSet() // Set  , 保证依赖的唯一 ，暂不实现

    // deps 是需要被执行的 watcher
    // newDeps 是执行后，新获取的 watcher
    // 因为在新渲染后 ，有些数据可能就用不到了，就需要清理 watcher . 以免修改该数据时， watcher 被执行
    // 但 watcher 的清理 ，并不是这个 watcher 真正意义的清理，而是从对应的 dep 中清理。也就是提供 watcher 的 deps 找到对应的 dep .
    // 从 dep 中删除对该 watcher  。这样子如果该数据更新 ，这个 watcher 也不会执行
    // 而新老 dep 是因为 dep 的清理是在执行后 。 而执行过程中，会有新的被依赖的 watcher 添加到 Dep.sub 中 。
    // 这里需要注意它的实现 ，于 Dep 清空的顺序
    this.newDeps = []
    this.newDepsIds = makeSet()

    // vue 中 ，如果是 lazy ， 则不会立即执行
    this.get()
  }

  /** 计算, 触发 getter */
  get() {
    // 将当前 watcher 压入栈
    pushTarget(this)
    this.getter.call(this.vm, this.vm); // 上下文的问题就解决了
    popTarget()
    this.cleanupDep()
  }

  /**
   * 执行, 并判断是懒加载, 还是同步执行, 还是异步执行: 
   * 我们现在只考虑 异步执行 ( 简化的是 同步执行 )
   */
  run() {
    this.get();
  }

  /** 对外公开的函数, 用于在 属性发生变化时触发的接口 */
  update() {
    // 在真正的 vue 中是调用 queueWatcher, 来触发 nextTick 进行异步的执行
    // 模拟 vue
    queueWatcher(this)
    // this.run();
  }

  /** 清空依赖队列 */
  cleanupDep() {
    let i = this.deps.length
    while (i--) {
      // 将不在 newDep 中的 watcher 从 dpe 的 sub 列表中删除 。在 get 时，会重新添加需要的 watcher
      const dep = this.deps[i]
      if (!this.newDepsIds.has(dep.id)) dep.removeSub(this)
    }
    this.deps = this.newDeps
    this.newDeps = []

    this.depIds = this.newDepsIds
    this.newDepsIds = makeSet()
  }

  // 添加 dep
  addDep(dep) {
    if (!this.newDepsIds.has(dep.id)) this.newDeps.push(dep)
  }
}