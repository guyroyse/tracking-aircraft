import 'dotenv/config'

import * as sbs1 from 'sbs1'
import * as redis from 'redis'

const sbs1Host = process.env['SBS1_SOURCE_HOST'] ?? 'localhost'
const sbs1Port = Number(process.env['SBS1_SOURCE_PORT'] ?? 30003)
const redisHost = process.env['REDIS_HOST'] ?? 'localhost'
const redisPort = Number(process.env['REDIS_PORT'] ?? 6379)
const redisPassword = process.env['REDIS_PASSWORD']

const streamKey = process.env['STREAM_KEY']

const sbs1Client = sbs1.createClient({ host: sbs1Host, port: sbs1Port })
const redisClient = redis.createClient({
  socket: { host: redisHost, port: redisPort },
  password: redisPassword })

redisClient.on('error', (err) => console.log('Redis Client Error', err))
await redisClient.connect()

const transmissionTypes = [
  'ES_IDENT_AND_CATEGORY',
  'ES_SURFACE_POS',
  'ES_AIRBORNE_POS',
  'ES_AIRBORNE_VEL',
  'SURVEILLANCE_ALT',
  'SURVEILLANCE_ID',
  'AIR_TO_AIR',
  'ALL_CALL_REPLY'
]

sbs1Client.on('message', msg => {

  let event = {}

  event.icacoId = msg.hex_ident
  event.type = transmissionTypes[msg.transmission_type - 1]
  event.generatedDateTime = toEpochMilliseconds(msg.generated_date, msg.generated_time).toString()
  event.loggedDateTime = toEpochMilliseconds(msg.logged_date, msg.logged_time).toString()

  if (msg.callsign !== null) event.callsign = msg.callsign.trim()
  if (msg.altitude !== null) event.altitude = msg.altitude.toString()
  if (msg.lat !== null) event.latitude = msg.lat.toString()
  if (msg.lon !== null) event.longitude = msg.lon.toString()
  if (msg.ground_speed !== null) event.velcoity = msg.ground_speed.toString()
  if (msg.track !== null) event.heading = msg.track.toString()
  if (msg.vertical_rate !== null) event.climb = msg.vertical_rate.toString()
  if (msg.is_on_ground !== null) event.onGround = msg.is_on_ground.toString()

  const thirtyMinutes = 30 * 60 * 1000
  const minId = new Date().getTime() - thirtyMinutes

  redisClient.xAdd(
    streamKey, '*', event, {
      TRIM: {
        strategy: 'MINID',
        strategyModifier: '~',
        threshold: minId
      }
    })
})

function toEpochMilliseconds(dateString, timeString) {
  const offset = new Date().getTimezoneOffset() * 60 * 1000
  const date = new Date(`${dateString.replaceAll('/', '-')}T${timeString}`)
  return date.getTime() - offset
}
