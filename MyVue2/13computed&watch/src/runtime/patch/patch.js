import { makeSet, isDef, isUnDef, isArray } from "../../shared";
import { VNode } from "../../vdom/vdom";

// hooks 类型
const hooks = ['create', 'activate', 'update', 'remove', 'destroy']
const emptyNode = new VNode('', {}, [])

// key tag 相同  , data 都有或者都没有 ，则可认为节点相同 ，具体内容和属性可以修改 
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    a.asyncFactory === b.asyncFactory &&
    ((a.tag === b.tag &&
      isDef(a.data) === isDef(b.data) &&
      sameInputType(a, b))
    )
  )
}

const isTextInputType = makeSet('text,number,password,search,email,tel,url')

// 如果是 input , type 需要一样
function sameInputType(a, b) {
  if (a.tag !== 'input') return true
  let i
  const typeA = isDef((i = a.data)) && isDef((i = i.attrs)) && i.type
  const typeB = isDef((i = b.data)) && isDef((i = i.attrs)) && i.type
  return typeA === typeB || (isTextInputType(typeA) && isTextInputType(typeB))
  // 如果 都是 文本类型的 ，视为相同 ，比如密码的可见修改
}


// 创建 oldVNode 的 map 映射 ，用于查找相同 vnode
function createKeyToOldIdx(children, beginIdx, endIdx) {
  let i, key
  const map = {}
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key
    if (isDef(key)) map[key] = i
  }
  return map
}

// 导出创建 pathc 函数的函数
export function createPatchFunction(backend) {
  let i, j
  const cbs = {}   // 回调对象 ，保存如 create , update 等对应的回调
  // 形如 cbs.update = [attrsUpdate,eventsUpdate,....]

  const { modules, nodeOps } = backend

  for (i = 0; i < hooks.length; i++) {
    let hk = hooks[i]
    cbs[hk] = []
    for (j = 0; j < modules.length; j++) {
      if (isDef(modules[j][hk])) {
        cbs[hk].push(modules[j][hk])
      }
    }
  }

  // 创建空节点 ，挂载 elm
  function emptyNodeAt(elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  // 删除节点
  function removeNode(el) {
    const parent = nodeOps.parentNode(el)
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el)
    }
  }

  // 插入节点
  function insert(parent, elm, ref) {
    if (isDef(parent)) {
      if (isDef(ref)) {
        if (nodeOps.parentNode(ref) === parent) {
          nodeOps.insertBefore(parent, elm, ref)
        }
      } else {
        nodeOps.appendChild(parent, elm)
      }
    }
  }

  // 创建子节点
  function createChildren(vnode, children) {
    if (isArray(children)) {
      for (let i = 0; i < children.length; ++i) {
        createElm(
          children[i],
          vnode.elm,
          null
        )
      }
    }
  }

  // 在 refElm 创建并插入节点
  function createElm(
    vnode,
    parentElm,
    refElm,
  ) {
    // debugger
    const tag = vnode.tag
    if (tag) {
      // 标签节点
      vnode.elm = nodeOps.createElement(tag, vnode)

      // 设置属性
      if (vnode.data) {
        for (let i = 0; i < cbs.create.length; ++i) {
          cbs.create[i](emptyNode, vnode)
        }
      }

      createChildren(vnode, vnode.children)
      insert(parentElm, vnode.elm, refElm)
    } else {
      // 文本节点
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
  }

  // vnodes 从 startIdx - endIdx  依次创建并添加
  function addVnodes(
    parentElm,
    refElm,
    vnodes,
    startIdx,
    endIdx
  ) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(
        vnodes[startIdx],
        parentElm,
        refElm
      )
    }
  }

  // 从 elm 的子孩子中移除 vnodes  startIdx  - endIdx
  function removeVnodes(vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx]
      if (isDef(ch)) {
        removeNode(ch.elm)
      }
    }
  }

  // 子孩子更新 diff
  function updateChildren(
    parentElm,
    oldCh,
    newCh,
  ) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // 循环 ，在可循环长度内
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUnDef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUnDef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else
        // 头头对比
        if (sameVnode(oldStartVnode, newStartVnode)) {
          // 更新当前节点
          patchVnode(
            oldStartVnode,
            newStartVnode
          )
          // index 都增加
          oldStartVnode = oldCh[++oldStartIdx]
          newStartVnode = newCh[++newStartIdx]
        } else
          // 尾尾比较
          if (sameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(
              oldEndVnode,
              newEndVnode
            )
            // index 都减少
            oldEndVnode = oldCh[--oldEndIdx]
            newEndVnode = newCh[--newEndIdx]
          } else
            // 头尾比较
            if (sameVnode(oldStartVnode, newEndVnode)) {
              // Vnode moved right
              patchVnode(
                oldStartVnode,
                newEndVnode
              )

              // 实际 位置 节点移动
              nodeOps.insertBefore(
                parentElm,
                oldStartVnode.elm,
                nodeOps.nextSibling(oldEndVnode.elm)  // 移动到 oldEndVnode 的后面
              )
              oldStartVnode = oldCh[++oldStartIdx]
              newEndVnode = newCh[--newEndIdx]
            } else
              // 尾头比较
              if (sameVnode(oldEndVnode, newStartVnode)) {
                // Vnode moved left
                patchVnode(
                  oldEndVnode,
                  newStartVnode
                )
                nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)  // 插入到 oldStartVnode 前面
                oldEndVnode = oldCh[--oldEndIdx]
                newStartVnode = newCh[++newStartIdx]
              } else {
                // 如果都不匹配
                /* 
                   1. oldKeyToIdx 收集 oldVnodes 的 key 和下标的对应
                   2. idxInOld 收集 vnodes 的 key 和 下标对应
                   （key 可以没有） 
                */
                if (isUnDef(oldKeyToIdx))
                  oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
                idxInOld =
                  (isDef(newStartVnode.key)  // 如果 newStartVnode 有 key
                    ? oldKeyToIdx[newStartVnode.key]   // 从 oldKeyToIdx 中取出对应的 index
                    : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx))  // 如果没有 ，则遍历寻找对应元素的 index

                // 如果没有对应的 ，即新元素 ，需要创建 。
                if (isUnDef(idxInOld)) {
                  // New element
                  createElm(
                    newStartVnode,
                    parentElm,
                    oldStartVnode.elm,  // 插入到此元素前
                  )
                } else {
                  // 如果有对应的元素
                  vnodeToMove = oldCh[idxInOld]  // 取出对应的 oldNode
                  if (sameVnode(vnodeToMove, newStartVnode)) {  // key 相同 ，比较其他是否相同，如果相同 .patch
                    patchVnode(
                      vnodeToMove,
                      newStartVnode
                    )
                    oldCh[idxInOld] = undefined   // 将对应的子孩子的 vnode 置为空 。

                    nodeOps.insertBefore(
                      parentElm,
                      vnodeToMove.elm,
                      oldStartVnode.elm  // 从当前尾巴前插入
                    )
                  } else {
                    // same key but different element. treat as new element
                    // key 相同 ，但是元素是不同的 ，重新创建
                    createElm(
                      newStartVnode,
                      parentElm,
                      oldStartVnode.elm
                    )
                  }
                }
                newStartVnode = newCh[++newStartIdx]
              }
    }

    // 当循环结束
    /* 
       有两种情况：oldStartIdx > oldEndIdx .  即 oldStartIndex 已经都处理完 。 newOld 有多出来的需要添加
    */
    if (oldStartIdx > oldEndIdx) {
      refElm = isUnDef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(
        parentElm,
        refElm,
        newCh,
        newStartIdx,
        newEndIdx
      )
    } else
      // newStartIdx > newEndIdx , 说明 newNode 都处理完 ，old 有剩下需要删除
      if (newStartIdx > newEndIdx) {
        removeVnodes(oldCh, oldStartIdx, oldEndIdx)
      }
  }

  // 从 oldIndexs 中
  function findIdxInOld(node, oldCh, start, end) {
    for (let i = start; i < end; i++) {
      const c = oldCh[i]
      if (isDef(c) && sameVnode(node, c)) return i
    }
  }

  // diff 算法 更新
  function patchVnode(
    oldVnode,
    vnode,
  ) {
    // 如果节点完全相同 ，即新 Vnode 是旧 VNode , 比如组件 ，静态节点
    if (oldVnode === vnode) {
      return
    }

    // oldVnode 创建的真实的 elm 添加到 vnode
    const elm = (vnode.elm = oldVnode.elm)

    let i
    const data = vnode.data
    const oldCh = oldVnode.children
    let ch = vnode.children
    if (isDef(data)) {
      // 调用 updata 回调 。更新属性 ， 更新事件等 , 对比新旧 Vnode , 更新真实的 ele . 而 oldVnode 是不更新的
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
    }
    // 如果没有文本内容
    if (isUnDef(vnode.text)) {
      /* 
          处理子节点
          分别对应都有子节点
          新节点有子节点
          旧节点有子孩子
          都没有子孩子但原本的节点有文本 。否则都没有子孩子且没有文本 ，即不用处理
      */
      if (isDef(oldCh) && isDef(ch)) {
        // 都有子孩子，且不同
        if (oldCh !== ch)
          //子孩子更新的 diff 算法
          updateChildren(elm, oldCh, ch)
      } else if (isDef(ch)) {
        // 去除旧 elm 中的文本 ，更新为新节点的子孩子
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1)
      } else if (isDef(oldCh)) {
        // 新节点没有子孩子且没有内容，需要将旧节点的子孩子清理
        removeVnodes(oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        // 都没有子孩子节点 ，旧节点有文本，清空文本
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      // 如果新旧文本不同，则更新文本内容
      // 如果旧节点有子孩子 ，也会被文本代替
      nodeOps.setTextContent(elm, vnode.text)
    }
  }


  // 返回 patch 函数
  return function patch(oldVnode, vnode) {
    // 判断 oldVnode 是否为真实 DOM 
    const isRealElement = isDef(oldVnode.nodeType)
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
      // 当 oldVNode 不是真实DOM ，而是旧 Vnode ，  并且 oldNode 和新 Vnode 是相同节点。如果不同 ，那么基本上相当于是重新更换了。
      // patch existing root node
      patchVnode(oldVnode, vnode)
    } else {
      // 第一次 ， old 是真实的 DOM
      if (isRealElement) {
        oldVnode = emptyNodeAt(oldVnode)
      }

      // replacing existing element
      const oldElm = oldVnode.elm
      const parentElm = nodeOps.parentNode(oldElm)

      // 创建新节点
      // debugger
      createElm(
        vnode,
        parentElm,
        nodeOps.nextSibling(oldElm)
      )

      // destroy old node
      if (isDef(parentElm)) {
        removeVnodes([oldVnode], 0, 0)
      }
    }

    return vnode.elm
  }
}