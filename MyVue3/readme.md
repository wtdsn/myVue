# 一些源码阅读过程的记录和分析
Vue3 修改了 watch 类为 ReactiveEffect 

## 整体原理对比

### 先理清一下 Vue2 的原理：（不过父子组件那些东西，我就没看）

watcher 是观察者。一个组件的实例或者组件内的 computed ,watch 都会生成自己的观察者。并且传递给观察者一个回调。
当状态变化时 ，观察者就会调用这个回调，更新组件，或者重新计算 computed , 或者指向 watch 函数。

那么谁通知观察者呢！就是 Dep 。 Dep 与状态关联。
每个状态都会有它的 Dep 。可以理解为依赖收集者 。Dep 维护一个数组，数组收集了状态的依赖者 ，也就是谁依赖了这个状态。是组件，还是 cmputed ， 还是 watch 。
因为 Dep 与状态关联，当状态变化时 ，就可以通知依赖者更新就可以了。

从上面的解释上看 ，依赖者就是666 watcher 。观察者观察的是数据的变化，更新的是组件，或者更新 computed ,watch 。 通知观察者状态变化的是 Dep


因此 在 get 时 ，收集依赖 ，因为只有 get 时，才能知道，谁需要这个状态。
在 set 时 通知依赖更新


以上的是原理的简述：下面以一个例子简要说明：

Vue 在初始状态时 ，会给 data 进行数据劫持。给 computed 创建观察者 ，给 watch 创建观察者。
这个观察者利用到 data 的数据时 ，就会执行到状态的 getter 。 getter 会创建它的 Dep 。Dep 收集依赖（实际上是依赖者的观察者 watcher 实例）

然后 Vue 会创建一个 updateComponent 函数，它的作用就是创建新 VDOM ，然后使用 patch 函数更新页面。
然后 vue 也会参加一个观察者 ，并且把 updateComponent 给这个观察者 。
当 创建 Vnode 时，因为会读取 data 。因此被读取的状态就会执行 getter  。收集页面更新的观察者 。

当状态变化时 ， 会执行状态的 setter 。setter 会执行 Dep.notify 。它的目的是通知 Dep 收集到的每一个依赖。
状态变化，应该更新。
那么合适的时候 ，这些依赖（watcher 实例）就会执行它们在创建时，传进来的回调。也就是 computed 就会重新执行 ， watch 也会执行 。 updateComponent 也会执行。


其他细节的东西：
- 因为变化的状态可能很多，因此更新不是同步的， Vue2 通过 nextTick 和队列对依赖进行更新。
- 依赖需要去重。比如页面对 data 某个状态依赖了两次，那么状态的 dep 收集依赖时，就只需要收集一个更新页面的观察者就可以了
- 依赖不是固定的。因此只有在 get 时收集依赖，即没有人读取，就不用收集。
- 因为依赖不是固定的，因此每次更新完后，依赖会清空。重新收集。因此  watcher 也会收集与它相关的 dep 。watcher 可以在执行完回调后，需要通知 dep 可以把自己清空了

### Vue3 的原理
基于 Vue2 。使用 proxy 代理了 Object.defineProperty 。
也是在 get 时收集依赖 。在 set 时通知依赖更新。
不过 ， Vue3 用 ReactiveEffect 代替了 watcher 类。目的是类似的。创建时传入回调。然后更新时执行回调。
effect 会被 Dep收集。不过这个过程做了一些修改
Vue3 在收集依赖时 ，调用了 track 函数 ，也就是 ，Dep 跟状态相关。但是是集中收集。而不是通过闭包。
因为 reactive 的参数是一个对象，此对应会对应一个唯一的 Deps 集合 。此集合收集了对象里属性所对应的 Dep 。

在 set 时 ，调用了 trigger 函数 ，此函数也是取出状态对应的 Dep 。然后通知更新。当然也是异步去执行的。


## VDOM 对比
Vue2 是全量对比。即新 VDOM 的所有节点都会拿去与 旧 VDOM 进行对比。后面的版本增加了了 static 标志。标志静态节点。即有子节点（不包括文本），且本身和子节点都没有动态值属性。事件等。即为 static 。
staick 为 true 的树会被缓存。因此新旧 VDOM 中它们是一致的。因此不用对比。直接复用。

Vue3 的优化有一下几点：

### patchFlags
对节点类型的一种标志。即它是完全的静态节点。还是只有 class 是动态的。只有 style 是动态的，或者只有事件，或者只有文本内容是动态的。
那么针对它的类型。在 patch 时，就可以针对化处理。省略了无效的一些对比。

### hoistStatic （hoist 提升）
类似于 Vue2 的 static 。对静态节点进行提升。其实就是只渲染一次。之后就使用缓存。


### cacheHandlers
不是太清楚它的作用。搜到的说是对事件的缓存。不过事件本身就有缓存吧！


## Diff 对比
### Vue2 采用递归 + 头尾指针
对于节点，如果相同则 patch 。对比更新
对于子节点，则使用头尾指针。
对新旧子节点数组进行头头对比，尾尾对比，头尾，尾头对比。相同则执行 patch 。 不同则查看是否可以通过 key 匹配。
最后都无匹配的话，就是新增加的元素。

好处：
- 如果序列改变不大。只是插入或删除些许节点。那么通过双端的对比。大部分是可以复用的

缺点：
- 因为只进行双端的对比。如果此时新子节点列表的头节点 在旧子节点列表的中间，而尾节点又不同。那么本来可以复用的节点。却需要重新创建。
- 则其实是一个大问题。因为它是一棵树。可能导致很多子节点需要重新创建。


### vue3 在 Vue2 的基础上做了一些改变和利用了最长递增子序列算法
Vue2 使用的是 3指针 。新旧子孩子列表起始指针相同，尾部指针不同。

- 分别通过两个循环，对比头部和尾部。如果相同则 patch 。并继续循环。不同则跳出循环
- 如果其中一个遍历完后，新节点还有，则添加。如果是旧节点还有则删除。


- 如果都还有剩下：遍历旧孩子列表剩下的部分。通过 key 或者双重遍历 ，找到在新子孩子列表中的位置并记录起来。同时将匹配到的相同节点进行 patch 。匹配不到的进行删除


- 计算下标记录的最长递增子序列。
- 倒序遍历新子节点剩余数组 , 不在记录里面的，说明需要新创建， 在子序列的不用动，在记录中但是不在序列中的的说明是需要移动。执行对应操作即可


几个细节点：
- 为什么使用最长递增子序列?
> 保持大部分节点不移动，通过删除新列表没有的，和移动少数的节点 ，从而通过较少的 DOM 操作。更新真实的DOM。
- 为什么最后是倒序新节点
> 最后部分倒序遍历新子节点是因为只有 intertBefore 这个API ，需要保证指针外的都是排序好的。
