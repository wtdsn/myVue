/* 
  处理事件
  会被函数进行一个封装
  
  比如原函数 click : f()
  会封装为 click:function($event){
   return f()
  }  
*/

const keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  delete: [8, 46]
}

const keyNames = {
  // IE11 and Edge use `Esc` for Escape key name.
  esc: ['Esc', 'Escape'],
  tab: 'Tab',
  enter: 'Enter',
  //  IE11 uses `Spacebar` for Space key name.
  space: [' ', 'Spacebar'],
  // IE11 uses key names without `Arrow` prefix for arrow keys.
  up: ['Up', 'ArrowUp'],
  left: ['Left', 'ArrowLeft'],
  right: ['Right', 'ArrowRight'],
  down: ['Down', 'ArrowDown'],
  //  IE11 uses `Del` for Delete key name.
  delete: ['Backspace', 'Delete', 'Del']
}

// 如果不是该按键，return 
const genGuard = condition => `if(${condition})return null;`

const modifierCode = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: genGuard(`$event.target !== $event.currentTarget`),
  ctrl: genGuard(`!$event.ctrlKey`),
  shift: genGuard(`!$event.shiftKey`),
  alt: genGuard(`!$event.altKey`),
  meta: genGuard(`!$event.metaKey`),
  left: genGuard(`'button' in $event && $event.button !== 0`),
  middle: genGuard(`'button' in $event && $event.button !== 1`),
  right: genGuard(`'button' in $event && $event.button !== 2`)
}

function genHandlers(events) {
  let eventStr = `on:{`
  let types = Object.keys(events)
  for (let i = 0, l = types.length; i < l; i++) {
    eventStr += `"${types[i]}":${genHandler(events[types[i]])},`
  }
  return eventStr.slice(0, -1) + '}'
}


function genHandler(handler) {
  if (!handler) {
    return 'function(){}'
  }

  // 占不考虑数组情况
  // if (Array.isArray(handler)) {
  //   return `[${handler.map(handler => genHandler(handler)).join(',')}]`
  // }

  let genModifierCode = ``, code = ``
  if (handler.modifiers) {
    const keys = []

    for (const key in handler.modifiers) {
      // 如果已经设置好
      if (modifierCode[key]) {
        genModifierCode += modifierCode[key]

        // left/right
        if (keyCodes[key]) {
          keys.push(key)
        }
      } else if (key === 'exact') {
        const modifiers = handler.modifiers
        genModifierCode += genGuard(
          ['ctrl', 'shift', 'alt', 'meta']
            .filter(keyModifier => !modifiers[keyModifier])
            .map(keyModifier => `$event.${keyModifier}Key`)
            .join('||')
        )
      } else {
        keys.push(key)
      }

      // 处理如 A ， B 等键
      if (keys.length) {
        code += genKeyFilter(keys)
      }
    }
  }

  // Make sure modifiers like prevent and stop get executed after key filtering
  if (genModifierCode) {
    code += genModifierCode
  }

  // 如果是 click="handle" 形式
  if (!/\(.*?\)/.test(handler.value)) {
    handler.value += '($event)'
  }


  return `function($event){${code} return ${handler.value}}`
}


function genKeyFilter(keys) {
  return (
    `if(!$event.type.indexOf('key')&&` +
    `${keys.map(genFilterCode).join('&&')})return null;`
  )
}

function genFilterCode(key) {
  // 如果直接给按键的 code
  const keyVal = parseInt(key, 10)
  if (keyVal) {
    return `$event.keyCode!==${keyVal}`
  }
  // 给的是 比如 click.a , 会转换成 _k 函数执行
  const keyCode = keyCodes[key]
  const keyName = keyNames[key]
  return (
    `_k($event.keyCode,` +
    `${JSON.stringify(key)},` +
    `${JSON.stringify(keyCode)},` +
    `$event.key,` +
    `${JSON.stringify(keyName)}` +
    `)`
  )
}