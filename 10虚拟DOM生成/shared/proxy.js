function proxy(target, attri, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    set(newV) {
      target[attri][key] = newV
    },
    get() {
      return target[attri][key]
    }
  })
}  