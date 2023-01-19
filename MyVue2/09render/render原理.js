// vue 中 ，会将模板 生成 AST  
//  生成 AST后 ，会被生成新的字符串
// 此字符串形式为 _c(xxxxx,xxx) ，
// 其表示该节点为什么类型 ，应该使用什么函数创建节点

// 为什么需要转换成如此的形式呢?
// 因为它本身是应该函数的字符串表达式
// 就比如 'f(a,b,c)'  , 是字符串 。 

// 比如
/* 
let str = `console.log(123)`

let f = new Function(str)

f()
*/

// render 字符串最后会被创建为函数
//   render = function(){ with(this){return code} ,
// code 其实就是一系列的执行函数

// this 是传入的 vm
// vm 会挂载创建节点的方法
// 比如

/* 
   let vm = {
  _c(data) {
    console.log("Create", data);
  }
}

let code = "_c('name')"
let render = `with(this){${code}}`

let _render = new Function(render)

_render.call(vm)  // create name

*/


// 也就是固定了函数如何调用 ，调用什么函数
// 好处就是 ，通过一次迭代 AST
// 确定了每个节点应该使用什么函数 。有什么数据
// 那么在之后就不需要重新去迭代 AST
// 而是直接调用

// 需要注意，在创建 render 前，
// 会使用 compiler 函数先遍历一次 AST 
// 通过 stack 标签是否为静态节点 ，即子元素或者本身有没有动态属性
// 如果没有为 true , 为可直接创建节点的元素
// 否则为 false ,  本身或者子节点需要于数据进行处理结合

// rootStack 则不考虑子节点。仅考虑自身有没有动态属性子类的