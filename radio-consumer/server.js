import 'dotenv/config'

import * as redis from 'redis'

const redisHost = process.env['REDIS_HOST'] ?? 'localhost'
const redisPort = Number(process.env['REDIS_PORT'] ?? 6379)
const redisPassword = process.env['REDIS_PASSWORD']

const streamKey = process.env['STREAM_KEY']

const aircraftDataLifetime = Number(process.env['AIRCRAFT_DATA_LIFETIME'] ?? 3600)


// connect to Redis
const redisClient = redis.createClient({
  socket: { host: redisHost, port: redisPort },
  password: redisPassword
})

redisClient.on('error', (err) => console.log('Redis Client Error', err))
await redisClient.connect()

// just start with recent events
let currentId = '$'

// check forever
while (true) {

  // wait at most a second for a result
  const result = await redisClient.xRead({ key: streamKey, id: currentId }, { BLOCK: 1000, COUNT: 1 })

  // loop if we have no results
  if (result === null) continue

  // pull the values for the event out of the result
  const [ { messages } ] = result
  const [ { id, message } ] = messages
  const event = { ...message }

  // update the current id so we get the next event next time
  currentId = id

  // create the object to set
  const aircraft = {}

  // set the always stuff
  aircraft.icaoId = event.icaoId,
  aircraft.dateTime = Number(event.loggedDateTime),
  aircraft.radio = event.radio

  // set the sometimes stuff
  if (event.callsign !== undefined) aircraft.callsign = event.callsign
  if (event.altitude !== undefined) aircraft.altitude = Number(event.altitude)
  if (event.latitude !== undefined) aircraft.latitude = Number(event.latitude)
  if (event.longitude !== undefined) aircraft.longitude = Number(event.longitude)
  if (event.velocity !== undefined) aircraft.velocity = Number(event.velocity)
  if (event.heading !== undefined) aircraft.heading = Number(event.heading)
  if (event.climb !== undefined) aircraft.climb = Number(event.climb)
  if (event.onGround !== undefined) aircraft.onGround = event.onGround === 'true'

  // set the location for geo searches
  if (event.latitude !== undefined && event.longitude !== undefined) {
    aircraft.location = `${event.longitude},${event.latitude}`
  }

  // set the data in Redis with an expiration
  const key = `aircraft:${event.icaoId}`
  // redisClient.json.merge(key, '$', aircraft)
  redisClient.sendCommand([ 'JSON.MERGE', key, '$', JSON.stringify(aircraft) ])
  redisClient.expire(key, aircraftDataLifetime)
}
