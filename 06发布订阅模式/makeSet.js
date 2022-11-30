function makeSet() {
  let set = {}

  return {
    add: function (key) {
      set[key] = true
    },
    remove: function (key) {
      set[key] = false
    },
    has: function (key) {
      return set[key] ? true : false
    },
    clear: function () {
      set = {}
    }
  }
}