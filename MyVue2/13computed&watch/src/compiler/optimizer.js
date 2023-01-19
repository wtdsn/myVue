import { makeSet } from '../shared/index'

/* 
   在讲 AST 解析成 render 字符串前 ，需要讲 AST 进行 Static 标志
   这是一种优化 。因为静态的树不需要进行比较修改。
   static 为 true 表示本身或子元素有动态渲染的数据
   staticRoot 为本身和子元素都是静态的。而且不仅一个子元素

   因为 staticRoot 为 true 的节点 ，会独立出 render 字符串。
   并且使用栈保存。
   如果 节点为静态的，单仅有一个文本节点 ，那么根本就不不需要进行静态渲染
   因为消耗反而更大。
*/
export function optimizer(ast) {
  markStatic(ast)
  markStaticRoots(ast, false)
}

// 标记 static
function markStatic(node) {
  // 通过类型和属性标记
  node.static = isStatic(node)
  // debugger
  // 标志子孩子，并且通过子孩子情况确定本身
  if (node.type === 1) {
    // 如果是组件
    if (!isHTMLTag(node.tag) && node.tag !== 'slot') {
      return
    }

    // 标记子孩子
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        const c = node.children[i]
        markStatic(c)

        // 如果子孩子有 false
        if (!c.static) {
          node.static = false
        }
      }
    }


    // 如果有 ifConditions
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        let block = node.ifConditions[i].block
        markStatic(block)
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}


// 通过  类型和属性判断是否为 static 节点
function isStatic(node) {
  if (node.type === 2) {
    return false
  }
  if (node.type === 3) {
    return true
  }

  // type 1
  return !!(!node.if && !node.for && !node.events && isHTMLTag(node.tag) && !node.bingdingAttrs && !node.styleBingding && !node.classBingding)
}


// 标记 staticRoot , isInfor 表示是为在 for 循环中
function markStaticRoots(node, isInFor) {
  // 只需要对  type = 1 的节点进行处理
  if (node.type === 1) {
    if (node.static &&
      node.children &&
      !(node.children.length === 1 && node.children[0].type === 3)) {
      node.staticRoot = true
    } else {
      node.staticRoot = false
    }
  }
  if (node.children) {
    for (let i = 0, l = node.children.length; i < l; i++) {
      markStaticRoots(node.children[i], isInFor || !!node.for)
    }
  }

  if (node.ifConditions) {
    for (let i = 1, l = node.ifConditions.length; i < l; i++) {
      markStaticRoots(node.ifConditions[i].block, isInFor || !!node.for)
    }
  }
}


let htmlTags = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'b', 'hr', 'br', 'header', 'footer', 'section', 'a', 'img', 'svg', 'canvas', 'input', 'button', 'ul', 'ol', 'li', 'textarea']
let htmlTagsMap = makeSet(htmlTags)

function isHTMLTag(tag) {
  return htmlTagsMap.has(tag)
}
