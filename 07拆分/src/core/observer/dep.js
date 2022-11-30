/* 
   Dep 依赖
*/
let depId = 1
class Dep {

  constructor() {
    this.id = depId++
    this.subs = []; // 存储的是与 当前 Dep 关联的 watcher .
  }

  /** 添加一个 watcher */
  addSub(sub) {
    this.subs.push(sub)
  }

  /** 移除 */
  removeSub(sub) {
    for (let i = 0; i < this.subs.length; i++) {
      if (this.subs[i] === sub) {
        this.subs.splice(i, 1)
        return
      }
    }
  }

  /** 将当前 Dep 与当前的 watcher ( 暂时渲染 watcher ) 关联*/
  depend() {
    if (Dep.target) {
      // 如果该 watcher 已经添加
      // debugger
      this.addSub(Dep.target)
      Dep.target.addDep(this)
    }
  }
  /** 触发与之关联的 watcher 的 update 方法, 起到更新的作用 */
  notify() {
    // console.log("notify");
    // debugger
    // 在真实的 Vue 中是依次触发 this.subs 中的 watcher 的 update 方法
    this.subs.forEach(w => {
      w.update()
    })
  }
}

/* 
   Dep 是全局的。
   target 是当前组件的 watcher
   通过 Dep.target 可访问当前的 watcher 。

   targetStack 用于缓存 watcher
*/
Dep.target = null;
const targetStack = []
function pushTarget(targte) {
  targetStack.push(targte)
  Dep.target = targte
}

function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}