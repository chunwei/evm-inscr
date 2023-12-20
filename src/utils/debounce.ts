export interface SourceFunction<T> {
  (...args: any[]): Promise<T>
}
export interface DebouncedFunction<T> {
  (...args: any[]): Promise<T>
}
const ps: any[] = []
export function debounce<T>(fn: SourceFunction<T>, delay: number): DebouncedFunction<T> {
  // console.log('create debounce func')
  let pResolver: ((value?: any) => void) | null = null
  // let pRejector: ((reason?: any) => void) | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: any[]) => {
    // console.log('call debounce func --- ', args[1])
    if (pResolver) {
      pResolver()
      pResolver = null
    }
    if (timer) {
      // console.log(`clearTimeout ${timer} && ${!!pResolver} pResolver()`)
      clearTimeout(timer)
      timer = null
    }
    // console.log('create new promise')
    const p = new Promise<T>((resolve, reject) => {
      pResolver = resolve
      // pRejector = reject
      timer = setTimeout(() => {
        // console.log(`${timer}: exec debounce func`)

        fn(...args)
          .then((result) => {
            // if (timer) clearTimeout(timer)
            // timer = null
            resolve(result)
          })
          .catch((reason) => {
            // console.log({ reason })
            // if (timer) clearTimeout(timer)
            // timer = null
            reject(reason.message)
          })
          .finally(() => {
            if (timer) clearTimeout(timer)
            timer = null
            // console.log(ps)
          })
      }, delay)
      // console.log(`new timer ${timer}`)
    })
    // ps.push(p)
    return p
  }
}

// function test_debounce() {
//   function fnA(n: number) {
//     console.log('A', n)
//     return Promise.resolve(n)
//   }
//   function fnB(n: number) {
//     console.log('B', n)
//     return Promise.resolve(n)
//   }
//   const debouncedA = debounce(fnA, 300)
//   const debouncedA1 = debounce(fnA, 300)
//   const debouncedB = debounce(fnB, 300)
//   debouncedA(1)
//   debouncedA(2)
//   debouncedA(3)
//   setTimeout(() => debouncedA(5), 500)
//   debouncedA1(11)
//   debouncedA1(12)
//   debouncedA1(13)
//   setTimeout(() => debouncedA1(15), 500)
//   debouncedB(1)
//   debouncedB(2)
//   debouncedB(3)
//   setTimeout(() => debouncedB(5), 500)
// }

// test_debounce()
// test_debounce()

// function runExample() {
//   const sourceFn = async (rule: any, value: any) => {
//     console.log({ value })
//     if (value > 10) {
//       return Promise.resolve(value)
//     }
//     return Promise.reject(`value ${value} must > 10`)
//   }

//   const debouncedFn = debounce(sourceFn, 300)
//   try {
//     sourceFn(undefined, 6)
//       .then((r) => console.log({ r }))
//       .catch((e) =>
//         console.log({
//           e
//         })
//       )

//     const dp3 = debouncedFn(undefined, 3)
//       .then((r) => console.log({ r }))
//       .catch((e) => {
//         console.log({ e })
//         return e
//       })
//     const dp4 = debouncedFn(undefined, 4)
//       .then((r) => console.log({ r }))
//       .catch((e) => {
//         console.log({ e })
//         return e
//       })
//     const dp1 = debouncedFn(undefined, 1)
//       .then((r) => console.log({ r }))
//       .catch((e) => {
//         console.log({ e })
//         return e
//       })
//     console.log({ dp1 })
//     const dp2 = debouncedFn(undefined, 2)
//       .then((r) => console.log({ r }))
//       .catch((e) => {
//         console.log({ e })
//         return e
//       })
//     console.log({ dp2 })
//     // debouncedFn(3)
//     //   .then((r) => console.log({ r }))
//     //   .catch((e) => {
//     //     e
//     //   })
//     //   setTimeout(() => debouncedFn(9), 400)
//     let dp9: any
//     setTimeout(() => (dp9 = debouncedFn(undefined, 9)), 800)
//     let dp15: any
//     setTimeout(() => (dp15 = debouncedFn(undefined, 15)), 500)
//     console.log('--- --- ---')
//     setTimeout(() => {
//       console.log('--- after 1s ---')
//       console.log({ dp1 })
//       console.log({ dp2 })
//       console.log({ dp3 })
//       console.log({ dp4 })
//       console.log({ dp9 })
//       console.log({ dp15 })
//     }, 1000)
//   } catch (eee) {
//     console.log({ eee })
//   }
// }

// runExample()
