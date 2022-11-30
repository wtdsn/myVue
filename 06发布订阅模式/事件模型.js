/* 
  事件模型
*/

let event = (() => {
  let eventQs = {}

  return {
    // on  注册事件
    on: function (type, cb) {
      (eventQs[type] || (eventQs[type] = [])).push(cb)
    },
    // off 卸载事件
    off: function (type, cb) {
      if (cb) {
        if (eventQs[type]) {
          let index = eventQs[type].indexOf(cb)
          if (index > -1)
          eventQs[type].splice(index, 1)
        }
      } else if (type) {
        eventQs[type] && (eventQs[type] = [])
      } else {
        eventQs = {}
      }
    },
    emit: function (type) {
      if (!type || !eventQs[type] || !eventQs[type].length) {
        return
      }

      let args = Array.prototype.slice.call(arguments, 1)

      eventQs[type].forEach(cb => {
        cb(args)
      });
    }
  }
})()