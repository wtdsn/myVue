import { makeSet } from "../../shared"

const queue = []
let idSet = makeSet()
let flushing = false

export function queueWatcher(watcher) {
  if (idSet.has(watcher.id)) return

  idSet.add(watcher.id)
  queue.push(watcher)

  if (!flushing) {
    setTimeout(() => {
      flushingQueue()
    }, 0)
  }
}

function flushingQueue() {
  console.log("更新");
  flushing = true
  // debugger
  for (let i = 0; i < queue.length; i++) {
    let watcher = queue[i]
    watcher.run()
    idSet.remove(watcher.id)
  }
  flushing = false
  queue.splice(0)
}