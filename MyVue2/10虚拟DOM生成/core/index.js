let uid = 1
function MyVue(options) {
  const vm = this

  vm._uid = uid++
  vm._self = vm

  this._parent = options.parent = document.querySelector(options.el).parentNode

  this._el = options.el
  this._data = options.data
  this.$options = options

  vm._renderProxy = vm


  // 数据监听
  initData(vm)

  // 挂载 _m _s _c 等方法
  initRender(vm)

  // 传入 el 开始处理
  this.$mount()
}


MyVue.prototype.mount = function () {
  let _mount = function () {
    this._update(this._render())
  }

  // 创建一个 watch . 传入渲染函数X
  new Watcher(this, _mount)
}


// 创建虚拟节点 ，返回虚拟节点
MyVue.prototype._render = function () {
  const vm = this
  const { render } = vm.$options
  return render.call(vm._renderProxy)
}

// 创建 _render 
MyVue.prototype.$mount = function () {
  const options = this.$options
  if (!options.render) {
    let template = document.querySelector(options.el).outerHTML

    const { render, staticRenderFns } = createCompiler(template, options)
    options.render = render
    options.staticRenderFns = staticRenderFns
  }
  this.mount()
}


/* 
   源码使用 diff 算法 ，使用新 VDOM 更新 旧 VDOM ，刷新页面
*/
MyVue.prototype._update = function (newDom) {
  console.log(newDom);
  // this._parent.replaceChild(newDom, document.querySelector(this._el))
}


function initData(vm) {
  observer(vm._data)

  Object.keys(vm._data).forEach(key => {
    proxy(vm, '_data', key)
  })
}


renderMinxin(MyVue)

function createCompiler(template, options) {
  const ast = parser(template.trim(), options)
  optimizer(ast)
  console.log("ast", ast);
  const code = generate(ast, options)

  return {
    ast,
    render: new Function(code.render),
    staticRenderFns: code.staticRenderFns.map(code => {
      return new Function(code)
    })
  }
}