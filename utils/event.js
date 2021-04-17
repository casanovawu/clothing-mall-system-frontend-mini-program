class Event{
  cache 
  constructor(){
    this.cache = {}
  }
  // 监听
  on(eventType, func){
    // this.cache[eventType] = func
    (this.cache[eventType] || (this.cache[eventType] = [])).push(func)
  }
  // 移除监听
  off(eventType, func){
    if (func){
      let stack = this.cache[eventType]
      if (stack && stack.length > 0){
        for(let j=0;j<stack.length;j++){
          if (stack[j] == func){
            stack.splice(j, 1)
            break
          } 
        }
      }
    }else{
      delete this.cache[eventType]
    }
  }
  // 监听一次
  once(eventType, func){
    function on(){
      this.off(eventType, on)
      func.apply(this, arguments)
    }
    this.on(eventType, on)
  }
  // 发布订阅通知
  emit(eventType, ...args){
    const stack = this.cache[eventType]
    if (stack && stack.length > 0){
      stack.forEach(item => item.apply(this, args))
    }
  }
}

export default Event