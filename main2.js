const delay = interval => {
  return new Promise(resolve => {
    setTimeout(resolve, interval)
  })
}

const taskTimeout = (promise, timeout) => {
  return new Promise((resolve, reject) => {
    const timeId = setTimeout(() => {
      reject('超时')
    }, timeout)
    promise.then(result => {
      window.clearTimeout(timeId)
      resolve(result)
    })
  })
}

const promisePoller = options => {
  const { fn, interval, masterTimeout, timeout, shouldContinue } = options
  let timeId

  return new Promise((resolve, reject) => {
    if (masterTimeout) {
      timeId = setTimeout(() => {
        reject('总超时')
      }, masterTimeout)
    }

    const poll = () => {
      let promiseFn = Promise.resolve(fn())
      if (timeout) {
        promiseFn = taskTimeout(promiseFn, timeout)
      }
      promiseFn
        .then(result => {
          if (shouldContinue(null, result)) {
            //shouldContinue(error,result){}
            delay(interval).then(poll)
          } else {
            if (timeId) {
              window.clearTimeout(timeId)
            }
            resolve(result)
          }
        })
        .catch(error => {
          console.log(error)
        })
    }

    poll()
  })
}

let n = 0

promisePoller({
  fn: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(1)
        n++
        resolve(n)
      }, 300)
    })
  },
  interval: 1000,
  masterTimeout: 5000,
  timeout: 500,
  shouldContinue: (error, promiseFn) => {
    if (error || n === 8) {
      return false
    } else {
      return true
    }
  }
}).then(
  data => {
    console.log(data)
  },
  error => {
    console.log(error)
  }
)
