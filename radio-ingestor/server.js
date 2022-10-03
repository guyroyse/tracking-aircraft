import 'dotenv/config'

import * as sbs1 from 'sbs1'
import * as redis from 'redis'

const sbs1Host = process.env['SBS1_SOURCE_HOST'] ?? 'localhost'
const sbs1Port = Number(process.env['SBS1_SOURCE_PORT'] ?? 30003)

const redisHost = process.env['REDIS_HOST'] ?? 'localhost'
const redisPort = Number(process.env['REDIS_PORT'] ?? 6379)
const redisPassword = process.env['REDIS_PASSWORD']

const streamKey = process.env['STREAM_KEY']
const streamLifetime = Number(process.env['STREAM_LIFETIME'] ?? 3600)

const radioId = process.env['RADIO_ID']


// connect to Redis
const redisClient = redis.createClient({
  socket: { host: redisHost, port: redisPort },
  password: redisPassword
})

redisClient.on('error', (err) => console.log('Redis Client Error', err))
await redisClient.connect()

// connect to SBS1 source and await messages
const sbs1Client = sbs1.createClient({ host: sbs1Host, port: sbs1Port })
sbs1Client.on('message', msg => {

  // create the event
  const event = {
    radio: radioId,
    icaoId: msg.hex_ident,
    type: toTransmissionType(msg.transmission_type),
    generatedDateTime: toEpochMilliseconds(msg.generated_date, msg.generated_time).toString(),
    loggedDateTime: toEpochMilliseconds(msg.logged_date, msg.logged_time).toString()
  }

  // add fields that might be in the message
  if (msg.callsign !== null) event.callsign = msg.callsign.trim()
  if (msg.altitude !== null) event.altitude = msg.altitude.toString()
  if (msg.lat !== null) event.latitude = msg.lat.toString()
  if (msg.lon !== null) event.longitude = msg.lon.toString()
  if (msg.ground_speed !== null) event.velocity = msg.ground_speed.toString()
  if (msg.track !== null) event.heading = msg.track.toString()
  if (msg.vertical_rate !== null) event.climb = msg.vertical_rate.toString()
  if (msg.is_on_ground !== null) event.onGround = msg.is_on_ground.toString()

  // find oldest event id to keep
  const oldestEventId = new Date().getTime() - streamLifetime * 1000

  // add the event to the stream, expiring old events
  redisClient.xAdd(
    streamKey, '*', event, {
      TRIM: {
        strategy: 'MINID',
        strategyModifier: '~',
        threshold: oldestEventId
      }
    })
})

function toEpochMilliseconds(dateString, timeString) {
  const offset = new Date().getTimezoneOffset() * 60 * 1000
  const date = new Date(`${dateString.replaceAll('/', '-')}T${timeString}`)
  return date.getTime() - offset
}

function toTransmissionType(type) {
  return [
    'ES_IDENT_AND_CATEGORY',
    'ES_SURFACE_POS',
    'ES_AIRBORNE_POS',
    'ES_AIRBORNE_VEL',
    'SURVEILLANCE_ALT',
    'SURVEILLANCE_ID',
    'AIR_TO_AIR',
    'ALL_CALL_REPLY'
  ][type - 1]
}
