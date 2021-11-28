// 自定义Promise
(function(window){
  const PENDING='pending'
  const RESOLVED='resolved'
  const REJECTED='rejected'

  // 定义Promise构造函数
  function Promise(excutor){
    const self=this
    self.status=PENDING
    self.data=undefined
    self.callbacks=[]

    function resolve(value){
      if(self.status !== PENDING) return
      self.status=RESOLVED
      self.data=value
      if(self.callbacks){
        setTimeout(()=>{
          self.callbacks.forEach(cbsObj => {
            cbsObj.onResolved(value)
          })
        })
      }
      
    }

    function reject(reason){
      if(self.status !== PENDING) return
      self.status=REJECTED
      self.data=reason
      if(self.callbacks){
        setTimeout(()=>{
          self.callbacks.forEach(cbsObj => {
            cbsObj.onRejected(reason)
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
  Promise.prototype.then = function (onResolved, onRejected) {
    const self = this
    
    onResolved = typeof onResolved==='function' ? onResolved : value => value // 将value向下传递
    onRejected = typeof onRejected==='function' ? onRejected : reason => {throw reason} // 将reason向下传递

    return new Promise((resolve, reject) => { // 什么时候改变它的状态

      //  1. 调用指定的回调函数
      // 2. 根据回调执行结果来更新返回promise的状态
      function handle (callback) {
        try {
          const result = callback(self.data)
          if (!(result instanceof Promise)) { //  2.2). 返回值不是promise   ==> 变为resolved, 结果值为返回值
            resolve(result)
          } else { // 2.3). 返回值是promise    ===> 由这个promise的决定新的promise的结果(成功/失败)
            result.then(
              value => resolve(value),
              reason => reject(reason)
            )
            // result.then(resolve, reject)
          }
        } catch (error) { // 2.1). 抛出error ==> 变为rejected, 结果值为error
          reject(error)
        }
      }

      if (self.status===RESOLVED) {
        setTimeout(() => {
          handle(onResolved)
        })
      } else if (self.status===REJECTED) {
        setTimeout(() => {
          handle(onRejected)
        })
      } else { // PENDING
        self.callbacks.push({
          onResolved (value) {
            handle(onResolved)
          }, 
          onRejected (reason) {
            handle(onRejected)
          }
        })
      }
    })
  }

  // 用来指定失败回调函数的方法
  // catch是then的语法糖
  Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected)
  }

  // Promise函数对象的resolve方法
  Promise.resolve=function(value){
    return new Promise((resolve,reject)=>{
      if(value instanceof Promise){
        value.then(
          resolve,
          reject
        )
      }else{
        resolve(value)
      }
    })
  }

  // Promise函数对象的reject方法
  Promise.reject=function(reason){
    return new Promise((resolve,reject)=>{
      reject(reason)
    })
  }

  // Promise函数对象的all方法
  Promise.all=function(promises){
    let count=0
    let pArr=new Array(promises.length)
    return new Promise((resolve,reject)=>{
      promises.forEach( (p,index) => {
        p.then(
          value=>{
            count++
            pArr[index]=value
            if(count === promises.length){
              resolve(pArr)
            }
          },
          reason=>reject(reason)
        )
      })
    })
  }

  // Promise函数对象的race方法
  Promise.race=function(promises){
    return new Promise((resolve,reject)=>{
      promises.forEach( p => {
        p.then(
          resolve,reject
        )
      })
    })
  }

  // 返回一个延迟指定时间才成功(也可能失败)的promise
  Promise.resolveDelay = function (value, time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 如果value是一个promise, 最终返回的promise的结果由value决定
        if (value instanceof Promise) {
          value.then(resolve, reject)
        } else { // value不是promise, 返回的是成功的promise, 成功的值就是value
          resolve(value)
        }
      }, time)
    })
  }

  // 返回一个延迟指定时间才失败的promise
  Promise.rejectDelay = function (reason, time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(reason)
      }, time)
    })
  }

   // 向外暴露Promise
   window.Promise = Promise

})(window)


