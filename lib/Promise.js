// 自定义Promise
(function(window){
  const PENDING='pending' //初始未确定状态
  const RESOLVED='resolved' //成功的状态
  const REJECTED='rejected' //失败的状态


  // 创建Promise构造函数
  function Promise(excutor){
    const self = this
    self.status = PENDING //初始化状态为PENDING
    self.data = undefined //初始化数据为undefined
    self.callbacks = [] //保存回调 {onResolved(){}, onRejected(){}}

    // 将promise的状态改为成功，指定成功的value
    function resolve(value){
      if(self.status !== PENDING) return
      self.status = RESOLVED
      self.data = value
      if(self.callbacks.length>0){
        setTimeout(()=>{
          self.callbacks.forEach(cbkObj => {
            cbkObj.onResolved(value)
          })
        })
      }
    }

    // 将promise的状态改为失败，指定失败的value
    function reject(reason){
      if(self.status !== PENDING) return
      self.status = REJECTED
      self.data = reason
      if(self.callbacks.length>0){
        setTimeout(()=>{
          self.callbacks.forEach(cbkObj => {
            cbkObj.onRejected(reason)
          })
        })
      }
    }

    try {
      excutor(resolve,reject)
    } catch (error) {
      reject(error)
    }
    
    
  }

  /* 
  用来指定成功/失败回调函数的方法
      1). 如果当前promise是resolved, 异步执行成功的回调函数onResolved
      2). 如果当前promise是rejected, 异步执行成功的回调函数onRejected
      3). 如果当前promise是pending, 保存回调函数
  返回一个新的promise对象
      它的结果状态由onResolved或者onRejected执行的结果决定
      2.1). 抛出error ==> 变为rejected, 结果值为error
      2.2). 返回值不是promise   ==> 变为resolved, 结果值为返回值
      2.3). 返回值是promise    ===> 由这个promise的决定新的promise的结果(成功/失败)
  */
  // promise对象的then方法
  Promise.prototype.then=function(onResolved,onRejected){
    const self = this

    //返回一个新的promise对象,它的结果状态由onResolved或者onRejected执行的结果决定
    return new Promise((resolve,reject)=>{

      /* 
        1. 调用指定的回调函数
        2. 根据回调执行结果来更新返回promise的状态
      */
      function handle(callback){
        try {
          const result = callback(self.data)
          if(result instanceof Promise){// 2.3). 返回值是promise    ===> 由这个promise的决定新的promise的结果(成功/失败)
            result.then(
              value=>{
                resolve(value)
              },
              reson=>{
                reject(reson)
              }
            )
            // result.then(resolve,reject)
          }else{// 2.2). 返回值不是promise   ==> 变为resolved, 结果值为返回值
            resolve(result)
          }
        } catch (error) {// 2.1). 抛出error ==> 变为rejected, 结果值为error
          reject(error)
        }
      }

      if(this.status === RESOLVED){ //1). 如果当前promise是resolved, 异步执行成功的回调函数onResolved
        setTimeout(()=>{
          handle(onResolved)
        })
      }else if(this.status === REJECTED){//2). 如果当前promise是rejected, 异步执行成功的回调函数onRejected
        setTimeout(()=>{
          handle(onRejected)
        })
      }else{ //3). 如果当前promise是pending, 保存回调函数
        self.callbacks.push({
          onResolved(){
            handle(onResolved)
          },
          onRejected(){
            handle(onRejected)
          }
        })
      }
      
      
      

    })
  }


  // promise对象的catch方法
  Promise.prototype.catch=function(onRejected){

  }

  // Promise函数对象的reslove方法
  Promise.resolve=function(value){

  }

  // Promise函数对象的reject方法
  Promise.reject=function(reason){

  }

  // Promise函数对象的all方法
  Promise.all=function(promises){

  }

  // Promise函数对象的race方法
  Promise.race=function(promises){

  }

  window.Promise=Promise
})(window)