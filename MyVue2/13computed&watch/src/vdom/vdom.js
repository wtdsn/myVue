import { toString } from "../shared"
export class VNode {
  constructor(
    tag,
    data,
    children,
    text,
    elm,
    context,
    componentOptions,
    /*     asyncFactory */
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.context = context

    this.componentOptions = componentOptions
    /*  this.asyncFactory = asyncFactory */

    this.isStatic = false
    this.key = data && data.key
    this.parent = undefined
  }
}


// 创建空节点 
export function createEmptyVNode(text) {
  const node = new VNode()
  node.text = text
  return node
}

// 或仅文字节点
export function createTextVNode(val) {
  return new VNode(undefined, undefined, undefined, toString(val))
}