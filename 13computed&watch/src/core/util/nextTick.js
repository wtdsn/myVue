/* 
   nextTick() 本质是一个微任务
   在支持 promise 的情况下 ，可以使用 then ,  因为 then 是一个微任务
   另外 MutationObserver API 也支持微任务
   setImmediate 这个API 游览器不太支持 。不过如果可以的话，也可以使用，它会在宏任务完成后立即执行。更接近微任务
   setTimeout  0ms  最后的无奈。
*/

// 执行多个 nextTick 时, 将回调存储在回调队列中，依次执行
let callBackQueue = []
// 是否处于触发阶段
let pending = false
// nextTick 内部执行的函数
let timerFunc

// 清空（依次执行）回调队列
function flushCallbacks() {
  pending = false
  const copies = callBackQueue.slice(0)
  callBackQueue.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

// 检测 Promise 是 native code 实现 。即非 JS 实现
function isNative(f) {
  return typeof f === 'function' && /native code/.test(f.toString())
}
// debugger
// 初始化 timerFunc 函数
if (isNative(Promise)) {

  let p = Promise.resolve()
  timerFunc = () => {
    // 微任务执行 flushCallbacks
    p.then(flushCallbacks)
  }
} else if (isNative(MutationObserver)) {
  // MutationObserver 监听一个 text 节点 ，通过同步任务改变节点内容 ，触发微任务回调
  let count = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(count))
  observer.observe(textNode, {
    characterData: true // 监听文本内容
  })

  // 触发回调
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
} else if (setImmediate && isNative(setImmediate)) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(cb, ctx) {
  callBackQueue.push(() => {
    cb.call(ctx)
  })

  if (!pending) {
    pending = true
    timerFunc()
  }
}