import { Dep } from './dep'

// 在定义时 ，给每个被劫持的数据创建 Dep
export function definedReacive(target, key, value) {
  // 该数据的依赖对象
  let dep = new Dep()

  // 对 value 进行 observer处理 ，并且获取它的 oberser对象 。 
  let childOb = observer(value)

  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get() {
      // console.log("get" + key);

      // 收集依赖 ， 只有依赖的改变，才需要触发更新
      dep.depend()

      // 如果 value 是对象或数组 。则其 observer 的 dpe 需要收集依赖
      // 即 对于 data.info.name 这样子的数据 ，当访问 name 时 ，不仅仅 name 需要收集依赖 ， info 也需要收集
      // 特别是在数组 ，因为数组的方法需要处理
      if (childOb) {
        childOb.dep.depend()
      }

      return value
    },
    set(nv) {
      // 如果没有改变 ，就不进行更新
      if (nv === value || (Number.isNaN(nv) && Number.isNaN(value))) return

      // console.log("set" + key);

      // 对 value 进行数据劫持 ，如果是引用值，只有整体替换时才会调用
      observer(value)
      value = nv

      // // 更新数据 ，实际没有那么简单，这里是模拟
      // window.$instance.mount()

      dep.notify()  // 派发更新
    },
  })
}

function Observer(o) {
  this.dep = new Dep()

  Object.defineProperty(o, '__ob__', {
    value: this,
    enumerable: false,
    configurable: true
  })

  // 仅处理引用数据

  let keys = Object.keys(o)
  if (Array.isArray(o)) {
    // 如果 o 是数组 ， 只其子元素进行处理 （且子元素需要是引用值）
    arrRefect(o)
    for (let i = 0; i < keys.length; i++) {
      observer(o[keys[i]])
    }
  } else {
    for (let i = 0; i < keys.length; i++) {
      definedReacive(o, keys[i], o[keys[i]])
    }
  }
}



// 通过递归 ，将对象全面响应化
export function observer(o) {
  if (o.__ob__) return o.__ob__

  if (typeof o === 'object' && o !== null) {
    // 如果该对象被 obserer 了，即被处理过了 。那么就不需要重新处理 。避免对象的循环引用 ，导致的死循环
    return new Observer(o)
  }
}


let arrRefect = createArrRefect()

function createArrRefect() {
  const methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ]

  if ({}.__proto__) {
    // 可访问 __proto__
    let f = function () { }
    f.prototype = Array.prototype
    let __proto__ = new f()
    let inserters
    methods.forEach(k => {
      __proto__[k] = function () {
        let args = [...arguments]
        switch (k) {
          case 'push':
          case 'unshift':
            inserters = args;
            break
          case 'splice':
            inserters = args.slice(2)
        }
        observer(inserters)
        let res = Array.prototype[k].apply(this, args)

        // 更新数据
        let dep = this.__ob__.dep
        dep.notify()

        return res
      }
    })

    return function (arr) {
      arr.__proto__ = __proto__
    }
  } else {
    return function (arr) {
      methods.forEach(k => {
        arr[k] = function () {
          let args = [...arguments]
          switch (k) {
            case 'push':
            case 'unshift':
              inserters = args;
              break
            case 'splice':
              inserters = args.slice(2)
          }
          observer(inserters)
          let res = Array.prototype[k].apply(this, args)

          // 更新数据
          let __ob__ = this.__ob__
          __ob__.notify()

          return res
        }
      })
    }
  }
}