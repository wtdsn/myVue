import MyVue from './src/runtime/runtime-with-compiler'

/* window.$instance = new MyVue({
  el: "#root",
  computed: {
    myc: function () {
      console.log("computed - 我只执行一次");
      return this.i * this.j
    }
  },
  watch: {
    i: {
      handler: function (cur, pre) {
        console.log("当前", cur);
        console.log("之前", pre);
      },
      immediate: true
    }
  },
  data: {
    data: '123',
    list: [{
      id: 1,
      name: 'jack'
    }, {
      id: 2,
      name: 'mary'
    }],
    i: 1,
    j: 3,
    v: "A1",
    p: "输入"
  },
  methods: {
    change() {
      // this.list.splice(1, 0, {
      //   id: 3,
      //   name: 'puty'
      // })
      this.i++

      setTimeout(() => {
        console.log("@5");
        this.j++
      }, 1000)
      console.log(this.data);
    }
  },
})
 */

new MyVue({
  el: "#root",
  data: {
    message: 'Hello Vue!'
  },
  methods: {
    say() {
      this.message = "Time" + Date.now()
    }
  }
})