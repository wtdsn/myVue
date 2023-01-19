import { MyVue } from "../core";
import { patch } from './patch/index'
import { mountComponent } from '../core/instance/lifecycle'

// patch 函数 ， diff 更新算法
MyVue.prototype.__patch__ = patch

// $mount  方法 , 内部执行 mountComponent
MyVue.prototype.$mount = function (el) {
  return mountComponent(this, el)
}


export default MyVue