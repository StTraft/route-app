require('dotenv').config()
import redis from 'redis'
import uuid from 'uuid/v4'
import { promisify } from 'util'
import { caughtErrorInPromise } from './Errors.js'
/**
 *   init redis client,
 *   should take options from env
 *
 */
const REDIS_NAMESPACE = process.env.REDIS_NAMESPACE
const client = redis.createClient()
const getAsync = promisify(client.get).bind(client)

client.on('connect', () => console.log('Redis is connected'))

client.on('error', err => {
  console.log('ERROR: something went wrong on redis server:', err)
  throw new Error('REDIS ERROR: something went wrong on redis server')
})

const parseTokenToKey = token => `${REDIS_NAMESPACE}/${token}`

export function setData(data = {}, token) {
  let _token = token || uuid()
  client.set(parseTokenToKey(_token), JSON.stringify(data), redis.print)
  return _token
}

export async function getData(token) {
  const returnDataAndRemoveKey = data => (client.del(key), data)
  const key = parseTokenToKey(token)

  let data = await getAsync(key)
    .then(JSON.parse)
    .then(returnDataAndRemoveKey)
    .catch(caughtErrorInPromise('REDIS ERROR'))
  // clear records afterward
  if (data === null) throw new Error(`RECORD ERROR: No pending query is associated with token ${token} or has been consumed.`)
  return data
}

export default {
  setData,
  getData
}
