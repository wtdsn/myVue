import { MyVue } from './src/core/index.js'

window.$instance = new MyVue({
  el: "#root",
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
      console.log(this.data);
    }
  },
})
