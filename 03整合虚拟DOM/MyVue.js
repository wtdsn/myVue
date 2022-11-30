function MyVue(options) {
  this._el = options.el
  this.data = options.data

  this.render = this.createRender()
  this.mount()
}


MyVue.prototype.mount = function () {
  let _mount = function () {
    this.update(this.render())
  }
  _mount.call(this)
}


/* 
   源码在此生成抽象语法树 ，并通过闭包缓存抽象语法树 .
   返回的 render 函数 ，作用是将数据和抽象语法树生成虚拟 DOM
*/


MyVue.prototype.createRender = function () {
  let target = document.querySelector(this._el)
  this._parent = target.parentNode
  let ast = createVDOM(target)

  return render = function () {
    return createDOM(ast, this.data)
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
  this._parent.replaceChild(newDom, document.querySelector(this._el))
}