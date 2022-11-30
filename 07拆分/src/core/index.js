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

  // 创建一个 watch . 传入渲染函数X
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