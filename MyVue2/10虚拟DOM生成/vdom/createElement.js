function createElement(
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

  // if (children && children.length) {
  //   children = normalizeArrayChildren(children)
  // }

  return new VNode(
    tag,
    data,
    children,
    undefined,
    undefined,
    context
  )
}

// function normalizeArrayChildren(children) {
//   const res = []
//   let i, c
//   for (i = 0; i < children.length; i++) {
//     c = children[i]

//     // 也是数组
//     if (Array.isArray(c)) {
//       if (c.length > 0) {
//         res.push(normalizeArrayChildren(c))
//       }
//     } else {
//       res.push(createTextVNode(c.text))
//     }
//   }

//   return res
// }