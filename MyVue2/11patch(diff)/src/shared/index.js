// 模拟 Set
export function makeSet(arr) {
  let set = {}

  if (typeof arr === 'string') {
    arr = arr.split(',')
  }

  if (Array.isArray(arr)) {
    for (let i = 0, l = arr.length; i < l; i++) {
      if (!set[arr[i]]) {
        set[arr[i]] = true
      }
    }
  }

  return {
    add: function (key) {
      set[key] = true
    },
    remove: function (key) {
      set[key] = false
    },
    has: function (key) {
      return set[key] ? true : false
    },
    clear: function () {
      set = {}
    }
  }
}


// 代理函数
export function proxy(target, attri, key) {
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

// 转换成字符串
export function toString(value) {
  if (value === null) {
    return ''
  }

  return typeof value === 'object'
    ? JSON.stringify(value, null, 2)
    : String(value)
}


// 检查属性本身是否有某属性
export function ownHas(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

// 是否为未定义 ， 空字符串属于 true 
export function isDef(v) {
  return (v !== undefined) && (v !== null)
}

// 将属性添加到另一个对象
export function extend(to, _from) {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

// v 是否未定义
export function isUnDef(v) {
  return v === undefined || v === null
}

export function isTrue(v) {
  return v === true
}

export function isFalse(v) {
  return v === false
}

export function isArray(v) {
  return Array.isArray(v)
}

// 将驼峰转为 - 
let hyphenateRe = /\B([A-Z])/g
export function hyphenate(str) {
  return str.replace(hyphenateRe, '-$1').toLowerCase()
}