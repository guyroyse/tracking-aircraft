import 'dotenv/config'

import * as redis from 'redis'
import { WebSocketServer } from 'ws'


const redisHost = process.env['REDIS_HOST'] ?? 'localhost'
const redisPort = Number(process.env['REDIS_PORT'] ?? 6379)
const redisPassword = process.env['REDIS_PASSWORD']

const streamKey = process.env['STREAM_KEY']

const webSocketPort = Number(process.env['WEBSOCKET_PORT'] ?? 80)


// connect to Redis
const redisClient = redis.createClient({
  socket: { host: redisHost, port: redisPort },
  password: redisPassword
})

redisClient.on('error', (err) => console.log('Redis Client Error', err))
await redisClient.connect()

// set up a basic web sockect server and a set to hold all the sockets
const wss = new WebSocketServer({ port: webSocketPort })
const sockets = new Set()

// when someone connects, add their socket to the set of all sockets
// and remove them if they disconnect
wss.on('connection', socket => {
  sockets.add(socket)
  socket.on('close', () => sockets.delete(socket))
})

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

  // create the event to publish
  const eventToPublish = {}

  // set the always stuff
  eventToPublish.icaoId = event.icaoId,
  eventToPublish.dateTime = Number(event.loggedDateTime),
  eventToPublish.radio = event.radio

  // set the sometimes stuff
  if (event.callsign !== undefined) eventToPublish.callsign = event.callsign
  if (event.altitude !== undefined) eventToPublish.altitude = Number(event.altitude)
  if (event.latitude !== undefined) eventToPublish.latitude = Number(event.latitude)
  if (event.longitude !== undefined) eventToPublish.longitude = Number(event.longitude)
  if (event.velocity !== undefined) eventToPublish.velocity = Number(event.velocity)
  if (event.heading !== undefined) eventToPublish.heading = Number(event.heading)
  if (event.climb !== undefined) eventToPublish.climb = Number(event.climb)
  if (event.onGround !== undefined) eventToPublish.onGround = event.onGround === 'true'

  // stringify and send to the all the listeners
  const json = JSON.stringify(eventToPublish)
  sockets.forEach(s => s.send(json))
}
