require('dotenv').config()
import redis from 'redis'
import uuid from 'uuid/v4'
import { promisify } from 'util'
/**
 *   init redis client,
 *   should take options from env
 *
 */
const REDIS_NAMESPACE = process.env.REDIS_NAMESPACE
const REDIS_KEY_EXPIRE_TIME = parseInt( process.env.REDIS_KEY_EXPIRE_TIME )
const client = redis.createClient({ttl: REDIS_KEY_EXPIRE_TIME})
const getAsync = promisify(client.get).bind(client)

client.on('connect', () => console.log('Redis is connected'))

client.on('error', err => {
  console.log('ERROR: something went wrong on redis server:', err)
  throw new Error('REDIS ERROR: something went wrong on redis server')
})

export function setData(data = {}, token) {
  let _token = token || uuid()
  let key = parseTokenToKey(_token)
  client.set(key, JSON.stringify(data), redis.print)
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
  console.log(err) // to system log
  return new Promise((_, rej) => rej(new Error(`${TYPE}: ${err.message}`))) 
}

export default {
  setData,
  getData
}
