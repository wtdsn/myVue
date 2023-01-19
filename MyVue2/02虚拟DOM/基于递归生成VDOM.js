/* 
   将模板节点转换成 VDOM
*/

/* 
  VDOM  对象描述了节点的类型，属性，内容等
*/

class VNode {
  constructor(tag, data, content, type) {
    this.tag = tag?.toLocaleLowerCase()  // 标签名 ，可能为文本，注释，无标签名
    this.data = data  // 属性对象
    this.content = content  // 文本内容
    this.type = type   // 类型 。 一般为 1 ， 文本为 3 
    this.children = []
  }

  appendChild(node) {
    this.children.push(node)
  }
}



/**
 * @param {element} node 
 * @returns {VDOM}
 */
function createVDOM(node) {
  let type = node.nodeType, vnode = null

  if (type === 1) {
    let attris = Array.from(node.attributes), data = {}

    attris.forEach((v) => {
      data[v.name] = v.value
    });

    vnode = new VNode(node.nodeName, data, undefined, 1)

    let children = node.childNodes || []
    children.forEach(v => {
      vnode.appendChild(createAST(v))
    })
  } else if (type === 3) {
    vnode = new VNode(undefined, null, node.textContent, 3)
  }
  return vnode
}


/* 
   实际上 , Vue 是将 模板转换成抽象语法树保留起来
   抽象语法树再生成 render 函数
   render 函数与数据结合成虚拟 DOM 

   新老虚拟DOM 对比，得出需要修改的部分
   通过 diff 算法 ，对比需要更新的部分去修改老的 虚拟DOM 
   而老的虚拟 DOM 与节点是一一对应的 。再去更新页面
*/