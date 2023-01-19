import { VNode } from "./vdom"
export function createElement(
  context,
  tag,
  data,
  children
) {
  // 实际上没有传入 data , 即此节点没有属性
  if (Array.isArray(data)) {
    children = data
    data = null
  }

  // 实际上是调用了 _createElement
  return _createElement(context, tag, data, children)
}

function _createElement(
  context,
  tag,
  data,
  children
) {
  // 如果为空 
  if (!tag) {
    return createEmptyVNode()
  }
  children = children?.flat(Infinity)

  return new VNode(
    tag,
    data,
    children,
    undefined,
    undefined,
    context
  )
}