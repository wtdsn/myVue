import MyVue from './src/runtime/runtime-with-compiler'

window.$instance = new MyVue({
  el: "#root",
  computed: {
    myc: function () {
      console.log("computed");
      return this.i * 3
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
    v: "A",
    p: "输入"
  },
  methods: {
    change() {
      // this.list.splice(1, 0, {
      //   id: 3,
      //   name: 'puty'
      // })
      this.i++
      console.log(this.data);
    }
  },
})
