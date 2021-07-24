const promisePoller = options => {
  const { fn, interval } = options
  const poll = () => {
    setTimeout(() => {
      fn()
      poll()
    }, interval)
  }
  poll()
}

promisePoller({
  fn: () => {
    console.log(1)
  },
  interval: 1000
})
