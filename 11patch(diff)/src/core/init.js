import { MyVue } from './index'
import { Watcher } from './observer/watcher'
import { parser } from '../ast/parser'
import { optimizer } from '../generate/optimizer'
import { generate } from '../generate/generate'
import { initRender, renderMinxin } from '../render/index'
import { observer } from './observer/index'
import { proxy } from '../shared'
import { patch } from '../patch/index'

MyVue.prototype._init = function () {
  const vm = this

  // 数据监听
  initData(vm)

  // 事件监听
  initEvents(vm)

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
  this.$el = document.querySelector(options.el)
  this.$parent = this.$el.parentNode
  if (!options.render) {
    let template = this.$el.outerHTML

    const { render, staticRenderFns } = createCompiler(template, options)
    options.render = render
    options.staticRenderFns = staticRenderFns
  }
  this.mount()
}


/* 
   源码使用 diff 算法 ，使用新 VDOM 更新 旧 VDOM ，刷新页面
*/
MyVue.prototype._update = function (vnode) {
  let vm = this
  const preEl = vm.$el
  const prevNode = vm._vnode
  vm._vnode = vnode
  if (!prevNode) {
    // 第一次
    vm.$el = vm.__patch__(preEl, vnode)
  } else {
    // 更新
    vm.$el = vm.__patch__(prevNode, vnode)
  }
}

MyVue.prototype.__patch__ = patch


function initData(vm) {
  observer(vm._data)

  Object.keys(vm._data).forEach(key => {
    proxy(vm, '_data', key)
  })
}

function initEvents(vm) {
  Object.keys(vm._methods).forEach((key) => {
    vm[key] = vm._methods[key].bind(vm)
  })
}


renderMinxin(MyVue)

function createCompiler(template, options) {
  const ast = parser(template.trim().replace(/<!--(.|\n|\r|\s)*?-->/g, ''), options)
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