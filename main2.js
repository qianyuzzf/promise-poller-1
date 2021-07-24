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
  const { fn, interval, masterTimeout, timeout, shouldContinue, retries } = options
  let timeId
  const rejections = []
  let retriesRemain = retries

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
          rejections.push(error)
          if (--retriesRemain === 0 || !shouldContinue(error)) {
            reject(rejections)
          } else {
            delay(interval).then(poll)
          }
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
      }, 600)
    })
  },
  interval: 1000,
  masterTimeout: 8000,
  timeout: 500,
  retries: 4,
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
