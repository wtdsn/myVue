import { initMixin } from "./instance/init"
import { renderMixin } from './instance/render'
import { lifecycleMixin } from "./instance/lifecycle"
import { stateMixin } from './instance/state'

// MyVue 构造函数
export function MyVue(options) {
  this._init(options)
}

// 挂载 vue 实例初始化函数 ， 也就是 _init
initMixin(MyVue)

// 生命周期函数相关挂载
lifecycleMixin(MyVue)

// 添加 $watch 等
stateMixin(MyVue)

// 解析 ， 生成 render 函数等
renderMixin(MyVue)

