const delay = interval => {
  return new Promise(resolve => {
    setTimeout(resolve, interval)
  })
}

const taskTimeout = (promise, timeout) => {
  return new Promise((resolve, reject) => {
    const timeId = setTimeout(() => {
      reject('TIMEOUT_TOKEN')
    }, timeout)
    promise
      .then(result => {
        window.clearTimeout(timeId)
        resolve(result)
      })
      .catch(error => {
        if (error === 'CANCEL_TOKEN') {
          reject(error)
        }
      })
  })
}

const promisePoller = options => {
  const { fn, interval, masterTimeout, timeout, shouldContinue, retries, retriesRemainCallback } = options
  let timeId
  let polling = true
  const rejections = []
  let retriesRemain = retries

  return new Promise((resolve, reject) => {
    if (masterTimeout) {
      timeId = setTimeout(() => {
        reject('MASTERTIMEOUT_TOKEN')
        polling = false
      }, masterTimeout)
    }

    const poll = () => {
      const xxx = fn()
      if (!xxx) {
        reject(rejections)
        polling = false
      }

      let promiseFn = Promise.resolve(xxx)
      if (timeout) {
        promiseFn = taskTimeout(promiseFn, timeout)
      }
      promiseFn
        .then(result => {
          console.log('n:', n)
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
          if (error === 'CANCEL_TOKEN') {
            reject(rejections)
            polling = false
          }
          rejections.push(error)
          if (retriesRemainCallback) {
            retriesRemainCallback(rejections, error)
          }
          if (--retriesRemain === 0 || !shouldContinue(error)) {
            reject(rejections)
          } else if (polling) {
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
        n++
        resolve(n)
      }, 600)
    })
  },
  interval: 1000,
  masterTimeout: 6000,
  timeout: 500,
  retries: 4,
  shouldContinue: (error, promiseFn) => {
    if (n === 8) {
      return false
    } else {
      return true
    }
  },
  retriesRemainCallback: (rejections, error) => {
    console.log(rejections, error)
  }
}).then(
  data => {
    console.log(data)
  },
  error => {
    console.log(error)
  }
)
