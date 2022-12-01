/* 
   _c 该方法对应的是`createElement`方法，顾名思义，它的含义是创建一个元素，
   它的第一个参数是要定义的元素标签名、第二个参数是元素上添加的属性，
   第三个参数是子元素数组，第四个参数是子元素数组进行归一化处理的级别。

   _v  该方法是创建一个文本结点。

  _s 是把一个值转换为字符串。

  _m 是渲染静态内容，它接收的第一个参数是一个索引值，
  指向最终生成的`staticRenderFns`数组中对应的内容，
  第二个参数是标识元素是否包裹在`for`循环内。
 

*/

import { genHandlers } from './event.js'

export function generate(ast, options) {
  // 处理 option 
  let state = new CodeState(options)
  const code = genElement(ast, state)
  console.log(code);
  return {
    render: `with(this){ return ${code}}`,
    staticRenderFns: state.staticRenderFns
  }
}


// 处理 options 为 codeState
function CodeState(options) {
  this.options = options
  this.staticRenderFns = []
}


// 创建 节点入口
function genElement(el, state) {
  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else {
    let tag = el.tag ? `'${el.tag}'` : '',
      data = genData(el, state),
      children = genChildren(el, state, true)

    return `_c(${tag}${data ? `,${data}` : ''}${children ? `,${children}` : ''})`
  }
}

// genStatic
function genStatic(el, state) {
  el.staticProcessed = true

  // 将 staticRoot 渲染函数 staticRenderFns
  state.staticRenderFns.push(`with (this) { return ${genElement(el, state)} } `)

  // 将其添加到 主 code 中 ， 第一个参数为 RenderFns 的下标
  return `_m(${state.staticRenderFns.length - 1}${el.staticInFor ? ',true' : ''})`
}


// 处理 For 节点
function genFor(el, state) {
  el.forProcessed = true

  const exp = el.for
  const alias = el.alias
  const iterator1 = el.iterator1 ? `, ${el.iterator1}` : ''

  // exp 为循环数组 ， 
  return (
    `_l(${exp}, function(${alias}${iterator1}) { return ${genElement(el, state)} })`
  )
}

// If
function genIf(el, state) {
  el.ifProcessed = true
  return genIfConditions(el.ifConditions, state)
}

// condition
// 对 if 的处理使用的是三目运算符
// (if)?_c():(elseif)?_c():_c()
function genIfConditions(conditions, state) {
  // 空
  if (!conditions.length) {
    return '_e()'
  }

  // 取出第一个
  let condition = conditions.shift()

  // if  elseif
  if (condition.exp) {
    return `(${condition.exp}) ? ${genElement(condition.block, state)}:${genIfConditions(conditions, state)} `
  } else {
    return `${genElement(condition.block, state)} `
  }
}


// 处理子节点
function genChildren(el, state) {
  const children = el.children
  // debugger
  if (children && children.length) {
    return `[${children.map(c => genNode(c, state)).join(',')}]`
  }
}

function genNode(node, state) {
  if (node.type === 1) {
    return genElement(node, state)
  } else if (node.type === 2) {
    return genText(node.express)
  } else {
    return genText(`\`${node.value}\``)
  }
}

function genText(text) {
  return `_v(${text})`
}

// 处理 属性
// 以对象形式 ，存储各种属性
function genData(el, state) {
  if (el.plain) return
  let data = "{"

  // key
  if (el.key) {
    data += `key:${el.key},`
  }

  // attributes
  if (el.attrs || el.bingdingAttrs) {
    data += `attrs:${genProps([...(el.attrs || []), ...(el.bingdingAttrs || [])])},`
  }


  // event handlers
  if (el.events) {
    data += `${genHandlers(el.events, false)},`
  }

  if (el.directives) {
    data += `directives:${genDirectives(el.directives)},`
  }

  data = data.replace(/,$/, '') + '}'

  return data
}

function genProps(props) {
  let staticProps = ``
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    staticProps += `"${prop.name}":${prop.value},`
  }
  return `{${staticProps.slice(0, -1)}}`
}


function genDirectives(directives) {
  let dir = ``
  for (let i = 0; i < directives.length; i++) {
    const k = directives[i]
    dir += `"${k.name}":${k.value},`
  }
  return `{${dir.slice(0, -1)}}`
}