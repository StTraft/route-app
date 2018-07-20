
export const caughtErrorInPromise = TYPE => err => {
  console.log(err) // to system log
  return new Promise((_, rej) => rej(new Error(`${TYPE}: ${err.message}`))) 
}

export default {
  caughtErrorInPromise
}