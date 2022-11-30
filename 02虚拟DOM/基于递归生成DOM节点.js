

/**
 * 使用递归生成节点
 * @param {VNode} vnode 
 * @returns {element} 
 */
function createDOM(vnode) {
  let {
    tag, type, data, content, children
  } = vnode, realDom = null

  if (type === 1) {
    // 创建节点
    realDom = document.createElement(tag)

    // 添加属性
    let arttis = Object.keys(data)
    arttis.forEach(attri => {
      realDom.setAttribute(attri, data[arttis])
    })


    children.forEach(c => {
      realDom.appendChild(createDOM(c))
    })

  } else {
    // 先对 content 进行数据渲染
    realDom = document.createTextNode(content)
  }

  return realDom
}