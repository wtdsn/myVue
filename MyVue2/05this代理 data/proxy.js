/* 
   在 vue 中 ，访问数据都是通过 this.xxx 而不是 this.data.xxx
   或者 this._data.xxx

   因此，需要加一层代理 ，将访问到 this 上的关于 data 中的属性代理到 this.data 上
*/


// 本质方法是通过 definedProperty 的 gette 和 setter 
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