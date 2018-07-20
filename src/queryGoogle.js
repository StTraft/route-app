require('dotenv').config()
import request from 'request-promise'
import qs from 'query-string'
import redisStore from './redisStore.js'

const API_KEY  = process.env.GOOGLE_MAP_API_API
// const API_KEY = 'AIzaSyCeSbi93WT6Gx8xmXKI_WBKkOPH5mF_6D8'
const API_HOST = process.env.GOOGLE_MAP_API_HOST

export default function queryGoogle(req, res) {
  res.setHeader('Content-Type', 'application/json')
  try {
    const initStoreData = {
      status: 'in progress',
      path: req.body || [], 
    }

    let token = redisStore.setData(initStoreData)

    let data = request.get( callGoogleApiFor(initStoreData.path) )
      .then( JSON.parse )
      .then( getShortestRoute )
      .then( pushRecordToRedisStore(token, initStoreData) )

    res.send({token})    
  }
  catch(err) {
    res.send({error: err.message})
  }
}

function callGoogleApiFor(path) {
  /**
   *   waypoints: [
   *     [lat, lon], // start
   *     ...
   *     [lat, lon]  // end
   *   ]
   */
  const locations = [...path]
  const origin      = locations.shift().join(',')
  const destination = locations.pop().join(',')
  const waypoints   = locations.map(loc => loc.join(',')).join('|')
  const queryString = qs.stringify({
    origin,
    destination,
    waypoints,
    key: API_KEY,
    alternatives: true    
  })
  return `${API_HOST}?${queryString}`
}

function getShortestRoute({routes}) {
  /**
   *   routes<Array>
   *     {
   *       legs: [
   *         distance: { value:[in metres] }, 
   *         duration: { value:[in seconds] }
   *       ]
   *     }
   *     ref: https://developers.google.com/maps/documentation/directions/intro#UnitSystems
   */
  // console.log('processing returned routes from goole API:', routes)
  if ( !routes && !(routes instanceof Array) ) {
    throw new Error("GOOGLE API ERROR: unable to fetch google directions API for proper route data.")
  }
  const zeroRoute = {
    total_distance: 0,
    total_time: 0
  }
  const longestRoute = {
    total_distance: Number.MAX_SAFE_INTEGER,
    total_time:     Number.MAX_SAFE_INTEGER
  }

  const toTotalDistanceAndTime = route =>
    // reduce route into an object with total distance and duration of legs
    route.legs.reduce( (res, leg) => ({
      total_distance: res.total_distance  + leg.distance.value,
      total_time:     res.total_time      + leg.duration.value
    }),
    zeroRoute
  )

  const toShortestRoute = (result, route) => route.total_distance < result.total_distance ? route : result
  
  let routesWithDistanceAndTime = routes.map(toTotalDistanceAndTime)
  // console.log('routesWithDistanceAndTime:', routesWithDistanceAndTime)
  let shortestRoute = routesWithDistanceAndTime.reduce(toShortestRoute, longestRoute)
  // console.log('shortestRoute:', shortestRoute)

  if (!routesWithDistanceAndTime.length) {
    console.log('no route return from google api.')
    throw new Error("ROUTE ERROR: No route is provided from google API.")
  }
  return shortestRoute
}

function pushRecordToRedisStore(token, initStoreData) {
  return route => {
    let data = {
      ...initStoreData,
      ...route,
      status: 'success'
    }
    redisStore.setData(data, token)
    return data
  }
}
