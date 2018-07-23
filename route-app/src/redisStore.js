import redis from 'redis'
import uuid from 'uuid/v4'
import { promisify } from 'util'
/**
 *   init redis client,
 *   should take options from env
 *
 */
const REDIS_PORT            = process.env.REDIS_PORT
const REDIS_HOST            = process.env.REDIS_HOST
const REDIS_NAMESPACE       = process.env.REDIS_NAMESPACE
const REDIS_KEY_EXPIRE_TIME = parseInt( process.env.REDIS_KEY_EXPIRE_TIME )

const client = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
  ttl:  REDIS_KEY_EXPIRE_TIME
})
const getAsync = promisify(client.get).bind(client)

client.on('connect', () => console.log('Redis is connected'))

client.on('error', err => {
  console.log('ERROR: something went wrong on redis server:', err)
})

export function setData(data = {}, token) {
  let _token = token || uuid()
  let key = parseTokenToKey(_token)
  client.set(key, JSON.stringify(data))
  return _token
}

export async function getData(token) {
  
  const key = parseTokenToKey(token)

  let data = await getAsync(key)
    .then(JSON.parse)
    .then(returnDataAndCleanRecords(key))
    .catch(caughtErrorInPromise('REDIS ERROR'))
  
  if (data === null) throw new Error(`RECORD ERROR: No pending query is associated with token ${token} or has been consumed.`)
  return data
}

const parseTokenToKey = token => `${REDIS_NAMESPACE}/${token}`

const returnDataAndCleanRecords = key => data => (client.del(key), data)

const caughtErrorInPromise = TYPE => err => {
  console.error(err) // to system log
  return new Promise((_, rej) => rej(new Error(`${TYPE}: ${err.message}`))) 
}

export default {
  setData,
  getData
}
