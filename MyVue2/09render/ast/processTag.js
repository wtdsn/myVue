/* 
   主要功能是处理节点

   原生属性作为 attrs
   非原生属性 转化为 xxxBinding , 比如 :class 转为 classBinding
   事件抽离到 events

   普通文本节点为 type  = 3
   有 {{}} 的文本节点为 type =2
   对有 {{}} 进行 token 分析 。暂不处理
*/

// @ 开头属性为事件 ， 其他不考虑
// : 开头为动态属性
// v-if
// v-for
// v-show
// 其他占不考虑

function processTag(ast, stack) {
  let rawAttrs = ast.rawAttrs, len = rawAttrs.length

  // plain 表示其本身没有属性
  if (len > 0) {
    ast.plain = false
    for (let i = 0; i < len; i++) {
      let attr = rawAttrs[i]
      processEvent(ast, attr) ||
        processIf(ast, attr, stack) ||
        processFor(ast, attr) ||
        processBinding(ast, attr) ||
        processDefult(ast, attr)
    }
  } else {
    ast.plain = true
  }
  return ast
}


// 将事件添加到 ast.events 中 ， 如果有 .stop 等修饰添加到 vent.modifiers 中
function processEvent(ast, attr) {
  if (attr.name[0] === '@') {
    let ms = attr.name.slice(1).split('.'), event = { value: attr.value }

    for (let i = 1; i < ms.length; i++) {
      (event.modifiers || (event.modifiers = {}))[ms[i]] = true
    }

    (ast.events || (ast.events = {}))[ms[0]] = event
    return true
  }
  return false
}

// 匹配 v-if v-else-if v-else 
// 分别添加 if , elseif  , else 属性
// 并且最后只保留 v-if  , 其他添加到 v-if 元素的 ifConditions 中
let ifRe = /(^v-if)|(^v-else)/
function processIf(ast, attr, stack) {
  let match = attr.name.match(ifRe)
  if (match) {
    if (attr.name === 'v-if') {
      ast.if = attr.value
      ast.ifConditions = [{
        exp: attr.value,
        block: ast
      }]
    } else {
      // 将当前 ast 添加到 v-if
      if (attr.name === 'v-else') {
        ast.else = attr.value
      } else {
        ast.elseif = attr.value
      }

      let borthers = stack[stack.length - 1].children
      while (borthers.length) {
        let bro = borthers.pop()
        if (bro.if) {
          bro.ifConditions.push({
            exp: attr.value,
            block: ast
          })
          borthers.push(bro)
          break
        }

        // 非空格
        if (bro.value && (bro.value.trim() !== '')) {
          new Error("text betwee if and else")
          return
        }

        continue
      }
    }

    return true
  }
  return false
}


// 处理 v-for
// 循环对象添加到 for 属性
// 值为 alias 属性 ， 索引为 iterator1 属性
function processFor(ast, attr) {
  if (attr.name === 'v-for') {
    let index = attr.value.lastIndexOf('in')
    let pre = attr.value.slice(0, index).trim(), last = attr.value.slice(index + 2).trim()

    pre = pre.replace(/\(|\)/g, '').split(',')

    ast.for = last
    ast.alias = pre[0].trim()

    if (pre[1]) {
      ast.iterator1 = pre[1].trim()
    }

    return true
  }
  return false
}

function processBinding(ast, attr) {
  if (attr.name[0] === ':') {
    let name = attr.name.slice(1)

    switch (name) {
      case 'key':
        ast.key = attr.value
        break
      case 'class':
      case 'style':
        ast[name + 'Bingding'] = attr.value
      // 占不加 break , 将动态的也加入到 bingdingAttrs中
      default:
        (ast['bingdingAttrs'] || (ast['bingdingAttrs'] = [])).push({ ...attr, name })
    }

    return true
  } return false
}

function processDefult(ast, attr) {
  if (attr.name === 'v-show') {
    ast.show = attr.value
    return true
  } else if (attr.name === 'key') {
    ast.key = `'${attr.value}'`
    return true
  } else if (attr.name === 'class') {
    attr.name = 'staticClass'
  } else if (attr.name === 'class') {
    attr.name = 'staticClass'
  } else if (attr.name === 'style') {
    attr.name = 'staticStyle'
  }

  (ast['attrs'] || (ast['attrs'] = [])).push({
    name: attr.name,
    value: `'${attr.value}'`
  })
  return true
}

function processText(ast) {
  if (ast.type === 2) {
    // 添加 express ，可在 render 中直接使用
    ast.express = processExpress(ast.value)
  }
  return ast
}


function processExpress(text) {
  if (!text.startsWith('{{')) {
    text = '"' + text
  }

  let isEndWidth = text.endsWith('}}')

  text = text.replace(/{{([^{}]+?)}}/g, (a, b, i) => {
    if (i === 0) {
      return `_s(${b})+"`
    } else {
      return `"+_s(${b})+"`
    }
  })

  if (isEndWidth) {
    return text.slice(0, -2)
  } else {
    return text + '"'
  }
}