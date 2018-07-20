import redisStore from './redisStore.js'
import { errorResponse } from './Errors.js'

export default async function fetchResult(req, res) {
  res.setHeader('Content-Type', 'application/json')
  try {
    const {
      token
    } = req.params

    let data = await redisStore.getData(token)

    res.send(data)
    return data
  }
  catch(err) {
    res.send({
      status: 'failure',
      error: err.message
    })
    return err
  }
}