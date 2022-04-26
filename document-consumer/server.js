import 'dotenv/config'
import * as redis from 'redis'
import { Client, Entity, Schema } from 'redis-om'

const streamKey = process.env['STREAM_KEY']

const redisClient = redis.createClient()
redisClient.on('error', (err) => console.log('Redis Client Error', err))
await redisClient.connect()

const omClient = await new Client().use(redisClient)

class AircraftStatus extends Entity {}

const schema = new Schema(AircraftStatus, {
  hex_ident: { type: 'string' },
  generated_date: { type: 'date' },
  logged_date: { type: 'date' },
  callsign: { type: 'string' },
  altitude: { type: 'number' },
  ground_speed: { type: 'number' },
  track: { type: 'number' },
  latlon: { type: 'point' },
  vertical_rate: { type: 'number' }
})

const repository = omClient.fetchRepository(schema)
await repository.createIndex()

let currentId = '$'
while (true) {

  const result = await redisClient.xRead(
    { key: streamKey, id: currentId }, { BLOCK: 1000, COUNT: 1 })

  if (!result) continue

  const messageAndId = result[0].messages[0]
  const message = messageAndId.message
  currentId = messageAndId.id

  let aircraft = await repository.search()
    .where('hex_ident').equals(message.hex_ident)
      .return.first()

  aircraft = aircraft ?? repository.createEntity()

  const generated_date = `${message.generated_date.replace(/\/+/g, '-')}T${message.generated_time}`
  const logged_date = `${message.logged_date.replace(/\/+/g, '-')}T${message.logged_time}`

  aircraft.hex_ident = message.hex_ident
  aircraft.generated_date = generated_date
  aircraft.logged_date = logged_date
  if (message.callsign) aircraft.callsign = message.callsign.trim()
  if (message.altitude) aircraft.altitude = Number(message.altitude)
  if (message.ground_speed) aircraft.ground_speed = Number(message.ground_speed)
  if (message.track) aircraft.track = Number(message.track)
  if (message.lat && message.lon) {
    aircraft.latlon = { latitude: Number(message.lat), longitude: Number(message.lon) }
  }
  if (message.vertical_rate) aircraft.vertical_rate = Number(message.vertical_rate)
  await repository.save(aircraft)
}
