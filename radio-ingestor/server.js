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
  event.generatedDateTime = toEpochMilliseconds(msg.generated_date, msg.generated_time)
  event.loggedDateTime = toEpochMilliseconds(msg.logged_date, msg.logged_time)

  if (msg.transmission_type === 1) {
    event.callsign = msg.callsign.trim()
    event.onGround = Boolean(msg.is_on_ground)
  }

  if (msg.transmission_type === 2) {
    console.log(msg)
  }

  if (msg.transmission_type === 3) {
    event.altitude = msg.altitude
    event.latitude = msg.lat
    event.longitude = msg.lon
    event.onGround = Boolean(msg.is_on_ground)
  }

  if (msg.transmission_type === 4) {
    event.velcoity = msg.ground_speed
    event.heading = msg.track
    event.climb = msg.vertical_rate
    event.onGround = Boolean(msg.is_on_ground)
  }

  if (msg.transmission_type === 5 || msg.transmission_type === 7) {
    event.altitude = msg.altitude
  }

  if (msg.transmission_type === 8) {
    event.onGround = Boolean(msg.is_on_ground)
  }

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
  return new Date(`${dateString.replaceAll('/', '-')}T${timeString}`).getTime()
}
