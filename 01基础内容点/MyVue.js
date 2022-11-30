/* 
   整合
*/


function MyVue(options) {
  /* 
     _ 下划线表示可读可写的私有变量
     $ 表示不可写的变量
  */

  const {
    el,
    data
  } = options

  this._el = el
  this._data = data

  // 初始模板的保留
  this.$template = document.querySelector(el)
  this.$parent = this.$template.parentNode

  this.render()
}


/* 
   渲染函数 ， clone 节点 。渲染数据 ，替换节点
*/
MyVue.prototype.render = function () {
  let newDom = (this.$template).cloneNode(true)  // 深克隆
  // 使用 克隆的 DOM 去渲染数据
  this.compiler(newDom, this._data)
  // 替换到页面
  this.updata(newDom)
}


MyVue.prototype.updata = function (newDom) {
  // 因为 this.$el 会在第一次被替换 ，因此需要重新获取
  // 而 this.$el 需要保留原模板，因此不能更换
  this.$parent.replaceChild(newDom, document.querySelector(this._el))
}


// 渲染函数
MyVue.prototype.compiler = function (template, data) {
  if (template.nodeName === "#text") {
    template.textContent = renderData(template.textContent, data)
  } else {
    if (template.hasChildNodes()) {
      let childNodes = template.childNodes

      for (const t of childNodes) {
        this.compiler(t, data)
      }
    }
  }
}

// 数据替换函数
/* 
   至此单属性
   支持对象内取出
   支持数组


   不支持运算
   不支持属性值为变量
   obj[key]
*/

/* 
   考虑到 ，数据变动多，而 path 变动少
   因此可以考虑函数柯里化 （形式上是一种闭包）
   将 path 缓存。通过返回一个函数 。传入 data 即可。
*/
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
   问题 ： 
   虚拟DOM
   每次数据变化都会重新 clone 节点
*/