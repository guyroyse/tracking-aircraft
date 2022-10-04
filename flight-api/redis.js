import * as redis from 'redis'
import { SchemaFieldTypes } from 'redis'

const redisHost = process.env['REDIS_HOST'] ?? 'localhost'
const redisPort = Number(process.env['REDIS_PORT'] ?? 6379)
const redisPassword = process.env['REDIS_PASSWORD']

// connect to Redis
export const redisClient = redis.createClient({
  socket: { host: redisHost, port: redisPort },
  password: redisPassword
})

redisClient.on('error', (err) => console.log('Redis Client Error', err))
await redisClient.connect()

// export the index name
export const aircraftIndex = 'aircraft:index'

// drop the index if it exists
try {
  await redisClient.ft.dropIndex(aircraftIndex)
} catch (error) {
  if (error.message !== 'Unknown Index name') throw error
}

// create the RediSearch index
await redisClient.ft.create(aircraftIndex, {
  'radio': SchemaFieldTypes.TAG,
  'icaoId': SchemaFieldTypes.TAG,
  'dateTime': SchemaFieldTypes.NUMERIC,
  'callsign': SchemaFieldTypes.TAG,
  'altitude': SchemaFieldTypes.NUMERIC,
  'latitude': SchemaFieldTypes.NUMERIC,
  'longitude': SchemaFieldTypes.NUMERIC,
  'location': SchemaFieldTypes.GEO,
  'velocity': SchemaFieldTypes.NUMERIC,
  'heading': SchemaFieldTypes.NUMERIC,
  'climb': SchemaFieldTypes.NUMERIC,
  'onGround': SchemaFieldTypes.TAG
}, {
  ON: 'HASH',
  PREFIX: 'aircraft:'
})
