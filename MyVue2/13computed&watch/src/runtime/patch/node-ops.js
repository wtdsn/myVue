/* 
  对 node 的原生操作方法的封装 
*/


// 创建元素
export function createElement(tagName, vnode) {
  let elm = document.createElement(tagName)
  if (tagName !== 'select') {
    return elm
  }
  if (vnode?.data?.attrs?.multiple !== undefined) {
    elm.setAttribute('multiple', 'multiple')
  }
  return elm
}

// 创建文本节点
export function createTextNode(text) {
  return document.createTextNode(text)
}

// 在 referenceNode 前插入 newNode
export function insertBefore(parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode)
}

// 从 node 中删除  child
export function removeChild(node, child) {
  node.removeChild(child)
}

export function appendChild(node, child) {
  node.appendChild(child)
}

export function parentNode(node) {
  try {
    return node.parentNode
  } catch (err) {
    console.log('err', err)
    console.log(node);
    debugger
  }
}

export function nextSibling(node) {
  return node.nextSibling
}

export function tagName(node) {
  return node.tagName
}

export function setTextContent(node, text) {
  node.textContent = text
}

