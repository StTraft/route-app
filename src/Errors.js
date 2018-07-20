
export const caughtErrorInPromise = TYPE => err => {
  console.log(err) // to system log
  throw new Error(`${TYPE}: ${err.message}`)
}

export default {
  caughtErrorInPromise
}