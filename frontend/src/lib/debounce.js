export function createKeyedDebouncer(delay) {
  const timers = new Map()

  return function debouncedCall(key, fn) {
    clearTimeout(timers.get(key))
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key)
        fn()
      }, delay)
    )
  }
}
