type InferArg<E, Type> = E extends { type: Type; arg: infer A } ? A : never

export const createEventEmmiter = <E extends { type: string; arg?: unknown }>() => {
  const listeners: Record<string, Set<(arg?: E['arg']) => void>> = {}
  function on<
    T extends E['type'],
    Fn extends E extends { type: T; arg: infer A extends E['arg'] }
      ? (arg?: A) => void
      : VoidFunction,
  >(event: T, fn: Fn) {
    listeners[event] ??= new Set()
    listeners[event].add(fn)
    return () => {
      listeners[event].delete(fn)
    }
  }
  function emit<T extends E['type'], Arg extends InferArg<E, T>>(event: T, args?: Arg) {
    listeners[event]?.forEach((fn) => fn(args))
  }
  function clear() {
    Object.keys(listeners).forEach((key) => {
      listeners[key].clear()
    })
  }

  return { on, emit, clear }
}
