import request from 'request-promise'
import qs from 'query-string'
import redisStore from './redisStore.js'

const API_KEY  = process.env.GOOGLE_MAP_API_API
const API_HOST = process.env.GOOGLE_MAP_API_HOST

export default function queryGoogle(req, res) {
  res.setHeader('Content-Type', 'application/json')
  try {
    const initStoreData = {
      status: 'in progress',
      path: req.body, 
    }

    if ( !(initStoreData.path instanceof Array) )
      throw new Error('improper data provided: path')
    if (initStoreData.path.length < 2)
      throw new Error('path should be at least 2 locations')
    initStoreData.path.forEach(location => {
      if ( !(location instanceof Array) || location.length !== 2 )
        throw new Error('location should be in format `[lat, lon]`')
      location.forEach(latOrLong => {
        if ( isNaN(parseFloat(latOrLong)) )
          throw new Error('lat or long value is not a number')
      })
    })

    let token = redisStore.setData(initStoreData)

    request.get( callGoogleApiFor(initStoreData.path) )
      .then( JSON.parse )
      .then( getShortestRoute )
      .then( pushRecordToRedisStore(token, initStoreData) )
      .catch( handleGoogleFetchError(token) )

    res.send({token})    
  }
  catch(err) {
    res.send({error: err.message})
  }
}

const handleGoogleFetchError = token => err => {
  process.env.NODE_ENV !== 'test' && console.log(err.message)
  redisStore.setData({
    status: 'failure',
    error: 'Something went wrong on fetching google api.'
  }, token)
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
