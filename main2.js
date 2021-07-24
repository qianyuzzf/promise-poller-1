const delay = interval => {
  return new Promise(resolve => {
    setTimeout(resolve, interval)
  })
}

const promisePoller = options => {
  const { fn, interval } = options
  const poll = () => {
    fn()
    delay(interval).then(poll)
  }
  poll()
}

promisePoller({
  fn: () => {
    console.log(1)
  },
  interval: 1000
})
