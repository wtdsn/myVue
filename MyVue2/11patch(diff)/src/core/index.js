import './init'

let uid = 1
export function MyVue(options) {
  const vm = this

  vm._uid = uid++
  vm._self = vm

  vm.$options = options
  vm._data = options.data
  vm._methods = options.methods

  vm._el = options.el

  vm._renderProxy = vm

  vm._init(options)
}
