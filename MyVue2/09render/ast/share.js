// 检查属性本身是否有某属性
function ownHas(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}