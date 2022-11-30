/* 
    响应式原理

    要做到响应式 。有两个关键点
    1. 如何知道数据改变
    2. 如果在改变后及时更新


    需要知道数据改变 ，在 Vue2 中 ， 借助了 Object.definedProperty 定义了属性的
    getter 和 setter 方法 。从而监听数据变化
    也就是数据劫持

    而及时的更新。就是在数据改变后 , 重新 render 即可


    在 vue2 中 ，对于数组 ，是不对数组元素进行劫持的。但数组内的元素，会单独做劫持 。比如元素内如果是对象，数组，那么该元素本身会被做劫持处理
*/


{

  /* 
     Object.definedProperty 
  */
  // 通过闭包 ，创建缓存 value 变量
  function definedReacive01(targte, key, value) {
    Object.defineProperty(targte, key, {
      configurable: true,
      enumerable: true,
      get() {
        console.log("get" + key);
        return value
      },
      set(nv) {
        console.log("set" + key);
        value = nv
      }
    })
  }


  // 通过递归 ，将对象全面响应化
  function reactify01(o) {
    // 仅处理引用数据
    if (typeof o === 'object' && o !== null) {
      let keys = Object.keys(o)
      for (let i = 0; i < keys.length; i++) {
        reactify(o[keys[i]])
        definedReacive(o, keys[i], o[keys[i]])
      }
    }
  }
}

/* 
 问题
 1. 数组通过 push ,shift 等操作如何处理 。 （注意，直接修改 len 无法处理，通过 arr[i] = 11 当 i 超出 length 也无法处理
 2. 引用数据如果被整体更换如何处理
*/

/* 
   针对上面的问题，进行处理
*/
function definedReacive(targte, key, value) {
  Object.defineProperty(targte, key, {
    configurable: true,
    enumerable: true,
    get() {
      console.log("get" + key);
      return value
    },
    set(nv) {
      console.log("set" + key);

      // 对 value 进行数据劫持 ，如果是引用值，只有整体替换时才会调用
      reactify(nv)
      value = nv
    },
  })
}


// 通过递归 ，将对象全面响应化
function reactify(o) {
  // 仅处理引用数据
  if (typeof o === 'object' && o !== null) {
    let keys = Object.keys(o)
    if (Array.isArray(o)) {
      // 如果 o 是数组 ， 只其子元素进行处理 （且子元素需要是引用值）
      arrRefect(o)
      for (let i = 0; i < keys.length; i++) {
        reactify(o[keys[i]])
      }
    } else {
      for (let i = 0; i < keys.length; i++) {
        reactify(o[keys[i]])
        definedReacive(o, keys[i], o[keys[i]])
      }
    }
  }
}

/* 
  解决 pop , shift 等方法的监听 ，可以有两种方法
  一种是先使用变量保存原方法的引用，再修改原型方法。如何在修改的方法内调用原方法 。 问题会时全局的原型方法都被修改

  第二种是增加一层原型对象 。因为原型链查询规则，会先使用最近的原型对象上的方法。

  第三种，直接在数组上添加方法。数组本质也是一种对象

   通过在数组实例和数组原型对象之间增加一个原型对象。添加 pop ,shift等方法。再调用数组原始对象对应的方法
   


   ES6 可使用 proxy 代理 。调用 Refect 使用原方法
*/



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
        reactify(inserters)
        let res = Array.prototype[k].apply(this, args)

        // 更新数据 ，实际没有那么简单，这里是模拟
        setTimeout(() => {
          window.$instance.mount()
        }, 0)

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
          reactify(inserters)
          let res = Array.prototype[k].apply(this, args)

          // 更新数据 ，实际没有那么简单，这里是模拟
          window.$instance.mount()

          return res
        }
      })
    }
  }
}


