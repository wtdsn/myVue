// 匹配起始标签 比如 <div   <p
const startTag = /^<([0-9a-zA-Z-]+)(?=[\s\/"'>])/

// 匹配起始标签的闭合 比如 >   />
const startTagClode = /^\s*(\/?)>/

// 匹配结束标签 如</div>
const endTag = /^<\/(.+?)>/

// 匹配属性
const attriRe = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

// 匹配 {{xxx}}
const moustache = /{{.+?}}/

// 栈
const stack = []


// 可非闭合标签
const noCloseTag = ['br', 'hr', 'img', 'input']

// Ast class
class Ast {
  constructor(type, tag, value) {
    this.type = type
    this.tag = tag
    this.value = value
    this.children = null
    this.father = null
    this.attrs = null
    this.rawAttrs = null
  }
}

function paser(temStr) {
  let textEnd
  while (temStr) {
    textEnd = temStr.indexOf('<')
    // 在起始的位置 ， 处理起始标签和属性，也可能是结束标签
    if (textEnd === 0) {
      // 先处理结束标签 , 再处理开始标签
      parseEndTag() || parseStarTag()
    } else if (textEnd > 0) {
      // 文本内容
      parseTextTag()
    } else {
      break
    }
  }

  // 处理起始标签和属性
  function parseStarTag() {
    let start = temStr.match(startTag)
    if (start) {
      advance(start[0].length)

      let ast = new Ast(1, start[1])

      // 匹配属性
      let attr, attrs = []
      while ((attr = temStr.match(attriRe)) && attr.index === 0) {
        advance(attr[0].length)
        attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || ''
        })
      }

      ast.rawAttrs = attrs

      // 匹配开始标签的闭合部分
      let startClose = temStr.match(startTagClode)
      advance(startClose[0].length)

      let afterProcess = processTag(ast, stack)
      // 如果是 else , elseif 则已经添加到 ifConfitions

      if (ownHas(afterProcess, 'elseif') || ownHas(afterProcess, 'else')) {
        return
      }

      if (startClose[1] || noCloseTag.includes(ast.tag)) {
        // 如果是单闭合标签或者是非闭合标签 ,比如 input
        handleTextOrSingle(afterProcess)
      } else {
        // 一般标签 ，即有闭合的另一个部分 比如 </div>
        stack.push(afterProcess)
      }
    }
  }

  // 处理结束标签
  function parseEndTag() {
    let end = temStr.match(endTag)
    if (end) {
      advance(end[0].length)
      handleEnd()
      return true
    }
    return false
  }

  // 内容文本
  function parseTextTag() {
    let text = temStr.slice(0, textEnd)
    if (text) {
      let type = moustache.test(text) ? 2 : 3

      // 压入 stack , 注意 ,tag 值是一个空格，不是空
      handleTextOrSingle(processText(new Ast(type, " ", text)))
    }
    advance(textEnd)
  }

  function advance(n) {
    // index += n
    temStr = temStr.slice(n)
  }

  // 将最后生成的抽象语法树返回
  return stack.pop()
}

// 栈顶标签可闭合，并出栈，添加为新栈顶元素的子节点
function handleEnd() {
  if (stack.length > 1) {
    let startTag = stack.pop()
    let parent = stack[stack.length - 1];
    startTag.parent = parent;
    (parent.children || (parent.children = [])).push(startTag)
  }
}

// 新标签为文本或单标签。之间没有其他标签。直接添加为栈顶标签的子节点
function handleTextOrSingle(ast) {
  let parent = stack[stack.length - 1];
  ast.parent = parent;
  (parent.children || (parent.children = [])).push(ast)
}
