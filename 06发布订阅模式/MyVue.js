function MyVue(options) {
  this._el = options.el
  this._data = options.data

  this.initData()
  // observer(this._data)

  this.render = this.createRender()
  this.mount()
}


MyVue.prototype.mount = function () {
  let _mount = function () {
    this.update(this.render())
  }

  // 创建一个 watch . 传入渲染函数
  new Watcher(this, _mount)
}


/* 
   源码在此生成抽象语法树 ，并通过闭包缓存抽象语法树 .
   返回的 render 函数 ，作用是将数据和抽象语法树生成虚拟 DOM
*/

// 这里使用 VDOM 模拟抽象语法树 。 
// 再使用 VDOM + data 生成有数据的 VDOM 
MyVue.prototype.createRender = function () {
  let target = document.querySelector(this._el)
  this._parent = target.parentNode
  let ast = createVDOM(target)

  return render = function () {
    return createDOM(ast, this._data)
  }
}


/**
 * @class VNode
 */
class VNode {
  constructor(tag, data, content, type) {
    this.tag = tag?.toLocaleLowerCase()  // 标签名 ，可能为文本，注释，无标签名
    this.attris = data  // 属性对象
    this.content = content  // 文本内容
    this.type = type   // 类型 。 一般为 1 ， 文本为 3 
    this.children = []
  }

  appendChild(node) {
    this.children.push(node)
  }
}

/* 
   创建 AST 
   vue 是获取节点，转成字符串 。然后将字符串转成 AST
*/
// 创建 AST
function createVDOM(node) {
  let type = node.nodeType, vnode = null

  if (type === 1) {
    let attris = Array.from(node.attributes), data = {}

    attris.forEach((v) => {
      data[v.name] = v.value
    });

    vnode = new VNode(node.nodeName, data, undefined, 1)

    let children = node.childNodes || []
    children.forEach(v => {
      vnode.appendChild(createVDOM(v))
    })
  } else if (type === 3) {
    vnode = new VNode(undefined, null, node.textContent, 3)
  }
  return vnode
}

// 根据 AST 和 data 生成 VDOM  （已渲染数据 VDOM）
function createDOM(vnode, data) {
  let {
    tag, type, attris, content, children
  } = vnode, realDom = null

  if (type === 1) {
    // 创建节点
    realDom = document.createElement(tag)

    // 添加属性
    let keys = Object.keys(attris)
    keys.forEach(key => {
      realDom.setAttribute(key, attris[key])
    })


    children.forEach(c => {
      realDom.appendChild(createDOM(c, data))
    })

  } else {
    // 先对 content 进行数据渲染
    realDom = document.createTextNode(renderData(content, data))
  }

  return realDom
}

/* 数据渲染 */
function renderData(text, data) {
  return text.replace(/\{\{(.+?)\}\}/g, (_, key) => {
    if (key.includes('.') || key.includes("[")) {
      key = key.replace(/\[|\]/g, (e) => {
        if (e === '[') {
          return '.'
        } else return ''
      })

      let keys = key.split('.'), v = data
      keys.every((k) => {
        v = v[k]
        return !!v
      })

      return v || ''
    } else {
      return data[key.trim()] || ""
    }

  })
}


/* 
   源码使用 diff 算法 ，使用新 VDOM 更新 旧 VDOM ，刷新页面
*/
MyVue.prototype.update = function (newDom) {
  console.log("update");
  this._parent.replaceChild(newDom, document.querySelector(this._el))
}


MyVue.prototype.initData = function () {
  observer(this._data)

  Object.keys(this._data).forEach(key => {
    proxy(this, '_data', key)
  })
}




// 在定义时 ，给每个被劫持的数据创建 Dep
function definedReacive(target, key, value) {
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
function observer(o) {
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